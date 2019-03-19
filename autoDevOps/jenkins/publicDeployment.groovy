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

    URI[] deployTargets
    String deployCredentialId
    String deployDirectory
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

    deployTargets:  params.DEPLOY_TARGETS.split('\n').collect{ new URI(it) },
    deployCredentialId: params.DEPLOY_CREDENTIAL,
    deployDirectory: params.DEPLOY_DIRECTORY,
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
    sh 'git clean -xdf -e node_modules'
    context.gitHead = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
}


def installDependencyStage(Context context) {
    sh "echo 'registry=${context.npmRegistry}' > .npmrc"
    sh "[ -f package-lock.json ] && rm package-lock.json || true"
    sshagent (credentials: [context.gitCredentialId]) {
        sh 'npm install --only=dev --ignore-scripts --unsafe-perm'
        sh 'npm install --ignore-scripts --unsafe-perm'
        sh 'npx lerna bootstrap --hoist --no-ci --ignore-scripts'
    }
}


def buildStage(Context context) {
    // legacy: collect version information
    sh 'npx ts-node application/src/containers/VersionInfo/GitRepo.ts'
    sh 'mv commitInfo.ts application/src/containers/VersionInfo/'
    // build with public build command
    sh 'npm run build:public'
    // write white list file
    writeFile file: context.whiteListFile, text: context.whiteList, encoding: 'utf-8'
    // update version info
    sh "sed -i 's/{{deployedCommit}}/${context.gitHead.substring(0,9)}/;s/{{deployedTime}}/${context.timestamp}/' ${context.buildDirectory}/static/js/versionInfo.*.chunk.js || true"
    // make package
    context.buildPackageName = "${context.gitBranch}-${context.gitHead}-${context.timeLabel}.tar.gz".toString()
    sh "tar -czvf ${context.buildPackageName} -C ${context.buildDirectory} ."
    // archive for trace back
    archiveArtifacts artifacts: context.buildPackageName, fingerprint: true
}

def deployStage(Context context) {
    context.deployTargets.each { deployTarget ->
        // clean old deployment
        // TODO: maybe we should make a backup
        sshCmd(deployTarget, context.deployCredentialId, "rm -rf ${context.deployDirectory}/*".toString())
        // copy package to target machine
        copyToRemote(deployTarget, context.deployCredentialId, context.buildPackageName, context.deployDirectory)
        // unpack package
        sshCmd(deployTarget, context.deployCredentialId,
            "tar -xvf ${context.deployDirectory}/${context.buildPackageName} -C ${context.deployDirectory}".toString()
        )
    }
}

node(context.buildNode) {
    prepareStage(context)
    checkoutStage(context)
    installDependencyStage(context)
    buildStage(context)
    deployStage(context)
}
