import jenkins.model.*
import java.net.URI
import java.util.TimeZone


def sshCmd(URI uri, String credentialId, String cmd) {
    String sshCmd = "ssh -q -o StrictHostKeyChecking=no -p ${uri.getPort()} ${uri.getUserInfo()}@${uri.getHost()}".toString()
    sshagent(credentials: [credentialId]) {
        return sh(returnStdout: true, script: "${sshCmd} \"${cmd}\"").trim()
    }
}

def copyToRemote(URI uri, String credentialId, String source, String target) {
    String remoteTarget = "${uri.getUserInfo()}@${uri.getHost()}:${target}".toString()
    sshagent(credentials: [credentialId]) {
        sh "rsync -azPq --delete --progress -e 'ssh -o StrictHostKeyChecking=no -p ${uri.getPort()}' ${source} ${remoteTarget}"
    }
}

class Context {
    String buildNode

    long timestamp
    String timeLabel

    String gitUrl
    String gitCredentialId
    String gitBranch
    String gitHead

    String whiteList
    String npmRegistry

    String buildDirectory
    String whiteListFile
    String buildPackageName
    String electronBuildDirectory

    URI[] deployTargets
    String deployCredentialId
    String deployDirectory
    String[] electronBuildUrls
}


Context context = new Context(
    buildNode: params.BUILD_NODE ?: env.BUILD_NODE,
    timestamp: System.currentTimeMillis(),
    timeLabel: new Date().format("yyyyMMddhhmmss", TimeZone.getTimeZone("Asia/Shanghai")),

    gitUrl: params.GIT_URL,
    gitCredentialId: params.GIT_CREDENTIAL,
    gitBranch:  params.GIT_BRANCH,

    whiteList: params.WHITE_LIST,
    npmRegistry: params.NPM_REGISTRY,

    buildDirectory: 'application/build',
    whiteListFile: 'application/build/whiteListedId.json',
    electronBuildDirectory: 'application/build/downloads',

    deployTargets:  params.DEPLOY_TARGETS.trim().split('\n').collect{ new URI(it) },
    deployCredentialId: params.DEPLOY_CREDENTIAL,
    deployDirectory: params.DEPLOY_DIRECTORY,
    electronBuildUrls: params.ELECTRON_BUILD_URLS.trim().split('\n'),
)


def prepareStage(Context context) {
    env.NODEJS_HOME = tool "v10.9.0" // install nodejs tool
    env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"  // set nodejs path
    env.TZ='UTC-8'  // set timezone
    sh 'env'  // print environment variable for debug
}


def checkoutStage(Context context) {
    checkout ([
        $class: 'GitSCM',
        branches: [[name: "*/${context.gitBranch}"]],
        userRemoteConfigs: [
            [
                url: context.gitUrl,
                credentialsId: context.gitCredentialId,
            ],
        ]
    ])
    sh 'git clean -xdf'
    context.gitHead = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
}


def installDependencyStage(Context context) {
    sh "echo 'registry=${context.npmRegistry}' > .npmrc"
    sshagent (credentials: [context.gitCredentialId]) {
        sh 'npm install @sentry/cli@1.40.0 --unsafe-perm'
        sh 'npm install --unsafe-perm'
    }
}


def buildStage(Context context) {
    // legacy: collect version information
    sh 'npx ts-node application/src/containers/VersionInfo/GitRepo.ts'
    sh 'mv commitInfo.ts application/src/containers/VersionInfo/'
    // build with public build command
    sh 'npm run build:public'

    // update version info
    dir(context.buildDirectory) {
        sh "rm whiteListedId.json"
        sh "sed -i 's/{{deployedCommit}}/${context.gitHead.substring(0,9)}/;s/{{deployedTime}}/${context.timestamp}/' static/js/versionInfo.*.chunk.js || true"
        sh "sed -i 's/{{buildCommit}}/${context.gitHead.substring(0,9)}/;s/{{buildTime}}/${context.timestamp}/' static/js/versionInfo.*.chunk.js || true"
        sh """rm -f precache-manifest.js.bak || true && cp -f precache-manifest.*.js precache-manifest.js.bak &&  awk -v rev="    \\"revision\\": \\"${context.timestamp}\\"," '/versionInfo/{sub(/.+/,rev,last)} NR>1{print last} {last=\$0} END {print last}' precache-manifest.js.bak > precache-manifest.*.js"""
        // in order to support gzip_static, we should create gz file after build, detail: FIJI-7895
        sh """find . -type f -size +150c -name "*.css" -o -name "*.html" -o -name "*.js" -o -name "*.json" -o -name "*.map" -o -name "*.svg"  -o -name "*.xml" | xargs -I{} bash -c 'gzip -9 < {} > {}.gz'"""
    }
    // make package
    context.buildPackageName = "${context.gitBranch}-${context.gitHead}-${context.timeLabel}.tar.gz".toString()
    sh "tar -czvf ${context.buildPackageName} -C ${context.buildDirectory} ."
    // archive for trace back
    archiveArtifacts artifacts: context.buildPackageName, fingerprint: true
}

def deployStage(Context context) {
    // the reason we break it into two parts is copy package to remote machine may take a long time
    // we hope that both machine updated at the same time
    // so we first copy package,
    // and then clean up the old version and unpack the new one

    // step 1: copy package to remote target
    parallel context.deployTargets.collectEntries { deployTarget -> [deployTarget.toString(), {
        // ensure dir exists
        sshCmd(deployTarget, context.deployCredentialId, "mkdir -p ${context.deployDirectory}".toString())
        // copy package to target machine
        copyToRemote(deployTarget, context.deployCredentialId, context.buildPackageName, context.deployDirectory)
    }]}

    // step 2: clean old version and unpack new one
    parallel context.deployTargets.collectEntries { deployTarget -> [deployTarget.toString(), {
        // clean old deployment
        // sshCmd(deployTarget, context.deployCredentialId,
        //    "find ${context.deployDirectory} -type f -not -name '*.tar.gz' | xargs rm".toString())
        // unpack package
        sshCmd(deployTarget, context.deployCredentialId,
            "tar -xvf ${context.deployDirectory}/${context.buildPackageName} -C ${context.deployDirectory}".toString())
    }]}
}

node(context.buildNode) {
    env.SENTRYCLI_CDNURL='https://cdn.npm.taobao.org/dist/sentry-cli'
    env.CI='false'
    stage('prepare') {prepareStage(context)}
    stage('checkout') {checkoutStage(context)}
    stage('install dependencies') {installDependencyStage(context)}
    stage('build') {buildStage(context)}
    stage('deploy') {deployStage(context)}
    sh "npm run releaseToSentry || true"
}
