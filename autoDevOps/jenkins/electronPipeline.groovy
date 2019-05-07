// This job support both triggered via manual and gitlab events.
import jenkins.model.*
import java.net.URI

String formatPath(String p) {
    try {
        return sh (returnStdout: true, script: "cygpath -u '${p}'").trim()
    } catch (e) {
        return p
    }
}

enum Platform {
    WIN, MAC
}

class BuildNode {
    String label
    Platform platform
}

class Context {
    String winBuildNode
    String macBuildNode

    String gitCredentialId

    String gitSourceUrl
    String gitSourceNamespace
    String gitSourceBranch

    String gitTargetUrl
    String gitTargetNamespace
    String gitTargetBranch

    String npmRegistry

    URI deployTarget
    String deployCredentialId
}

void prepareStage(Context context) {
    env.NODEJS_HOME = tool "v10.9.0" // install nodejs tool
    env.PATH="${formatPath(env.NODEJS_HOME)}:${formatPath(env.NODEJS_HOME)}/bin:${env.PATH}"
    env.TZ='UTC-8'  // set timezone
    sh 'env'
}

void checkoutStage(Context context) {
    checkout ([
        $class: 'GitSCM',
        branches: [[name: "${context.gitSourceNamespace}/${context.gitSourceBranch}"]],
        extensions: [
            [$class: 'PruneStaleBranch'],
            [
                $class: 'PreBuildMerge',
                options: [
                    fastForwardMode: 'FF',
                    mergeRemote: context.gitTargetNamespace,
                    mergeTarget: context.gitTargetBranch,
                ]
            ]
        ],
        userRemoteConfigs: [
            [
                credentialsId: context.gitCredentialId,
                name: context.gitTargetNamespace,
                url: context.gitTargetUrl,
            ],
            [
                credentialsId: context.gitCredentialId,
                name: context.gitSourceNamespace,
                url: context.gitSourceUrl,
            ]
        ]
    ])
    sh 'git clean -xdf'
}


void installDependencyStage(Context context) {
    sh "echo 'registry=${context.npmRegistry}' > .npmrc"
    sshagent (credentials: [context.gitCredentialId]) {
        sh 'npm cache clean --force'
        sh 'npm install --unsafe-perm'
    }
}

void buildStage(Context context, BuildNode buildNode) {
    sh ([
        (Platform.MAC): 'npm run pack:mac',
        (Platform.WIN): 'npm run pack:win',
    ][buildNode.platform])
}

void deployStage(Context context) {
    // keep both name with version and without version
    sh 'cp ./dist/*.exe ./dist/RingCentral.exe'
    // copy source
    String source = './dist/*.exe'
    // copy target
    URI uri = context.deployTarget
    String remoteTarget = "${uri.getUserInfo()}@${uri.getHost()}:${uri.getPath()}".toString()
    // do copy
    sshagent(credentials: [context.deployCredentialId]) {
        sh "scp -o StrictHostKeyChecking=no -P ${uri.getPort()} ${source} ${remoteTarget}"
    }
}

// Initiate default context variable by user data
Context context = new Context(
    winBuildNode: params.WIN_BUILD_NODE ?: env.WIN_BUILD_NODE,
    macBuildNode: params.MAC_BUILD_NODE ?: env.MAC_BUILD_NODE,

    gitCredentialId: params.GIT_CREDENTIAL,
    gitSourceUrl: params.GIT_URL,
    gitSourceBranch:  params.GIT_BRANCH,
    gitSourceNamespace: params.GIT_NAMESPACE,

    npmRegistry: params.NPM_REGISTRY,
    deployTarget: new URI(params.DEPLOY_TARGET),
    deployCredentialId: params.DEPLOY_CREDENTIAL,
)

// Override default context variable if this job is triggered by gitlab events
context.gitSourceUrl       = env.gitlabSourceRepoSshUrl?: context.gitSourceUrl
context.gitSourceBranch    = env.gitlabSourceBranch ?: context.gitSourceBranch
context.gitSourceNamespace = env.gitlabSourceNamespace ?: context.gitSourceNamespace

context.gitTargetUrl       = env.gitlabTargetRepoSshUrl?: context.gitSourceUrl
context.gitTargetBranch    = env.gitlabTargetBranch ?: context.gitSourceBranch
context.gitTargetNamespace = env.gitlabTargetNamespace ?: context.gitSourceNamespace

def buildNodes = []
if (context.winBuildNode)
    buildNodes.push(new BuildNode(platform: Platform.WIN, label: context.winBuildNode))
// if (context.macBuildNode)
//     buildNodes.push(new BuildNode(platform: Platform.MAC, label: context.macBuildNode))

// Get started
parallel buildNodes.collectEntries { buildNode -> [buildNode.label, {
    node(buildNode.label) {
        env.SENTRYCLI_CDNURL='https://cdn.npm.taobao.org/dist/sentry-cli'

        stage('prepare') { prepareStage(context) }
        stage('checkout') { checkoutStage(context) }
        stage('install dependencies') { installDependencyStage(context) }
        stage('build') { buildStage(context, buildNode) }
        stage('deploy') { deployStage(context) }
    }
}]}
