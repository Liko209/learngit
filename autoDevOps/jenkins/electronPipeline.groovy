// This job support both triggered via manual and gitlab events.
import jenkins.model.*
import java.net.URI

class Context {
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

class JobTemplate {

    def script
    String nodeLabel
    Context context

    String suffix() {''}

    String formatPath(String p) {
        try {
            return script.sh (returnStdout: true, script: "cygpath -u '${p}'").trim()
        } catch (e) {
            return p
        }
    }

    void checkoutStage() {
        script.checkout ([
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
        script.sh 'git clean -xdf'
    }

    void installDependencyStage() {
        script.sh "echo 'registry=${context.npmRegistry}' > .npmrc"
        script.sshagent (credentials: [context.gitCredentialId]) {
            script.sh 'npm cache clean --force'
            script.sh 'npm install --unsafe-perm'
        }
    }

    void buildStage() { }

    void deployStage() {
        // keep both name with version and without version
        script.sh "cp ./dist/*.${suffix()} ./dist/RingCentral.${suffix()}"
        // copy source
        String source = "./dist/*.${suffix()}".toString()
        // copy target
        URI uri = context.deployTarget
        String remoteTarget = "${uri.getUserInfo()}@${uri.getHost()}:${uri.getPath()}".toString()
        // do copy
        script.sshagent(credentials: [context.deployCredentialId]) {
            script.sh "scp -o StrictHostKeyChecking=no -P ${uri.getPort()} ${source} ${remoteTarget}"
        }
    }

    void run() {
        script.node(nodeLabel) {
            String envNodeJsHome = script.tool "v10.9.0" // install nodejs tool
            String envPath ="${formatPath(envNodeJsHome)}:${formatPath(envNodeJsHome)}/bin"

            script.withEnv([
                "PATH+NODEJS=${envPath}",
                "SENTRYCLI_CDNURL=https://cdn.npm.taobao.org/dist/sentry-cli"
            ]) {
                script.sh('env')
                script.stage('checkout') { checkoutStage() }
                script.stage('install dependencies') { installDependencyStage() }
                script.stage('build') { buildStage() }
                script.stage('deploy') { deployStage() }
            }
        }
    }
}

class MacJob extends JobTemplate {
    String suffix() { 'dmg' }

    String macCscFileId
    String macCscKeyPasswordId

    void buildStage() {
        script.withCredentials([
            script.file(credentialsId: macCscFileId, variable: 'CSC_LINK'),
            script.string(credentialsId: macCscKeyPasswordId, variable: 'CSC_KEY_PASSWORD'),
        ]) {
            script.sh 'npm run pack:mac'
        }
    }
}

class WinJob extends JobTemplate {
    String suffix() { 'exe' }

    String winCscFileId
    String winCscKeyPasswordId

    void buildStage() {
        script.withCredentials([
            script.file(credentialsId: winCscFileId, variable: 'CSC_LINK'),
            script.string(credentialsId: winCscKeyPasswordId, variable: 'CSC_KEY_PASSWORD'),
        ]) {
            script.sh 'npm run pack:win'
        }
    }
}

// Initiate default context variable by user data
Context context = new Context(
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


// Create jobs
def jobs = []
if (params.WIN_BUILD_NODE)
    jobs.push(
        new WinJob(
            winCscFileId: params.WIN_CSC_FILE,
            winCscKeyPasswordId: params.WIN_CSC_PASSWORD,
            nodeLabel: params.WIN_BUILD_NODE,
            context: context,
            script: this)
    )
if (params.MAC_BUILD_NODE)
    jobs.push(
        new MacJob(
            macCscFileId: params.MAC_CSC_FILE,
            macCscKeyPasswordId: params.MAC_CSC_PASSWORD,
            nodeLabel: params.MAC_BUILD_NODE,
            context: context,
            script: this)
    )

// Get started
parallel jobs.collectEntries { job -> [job.nodeLabel, {
    job.run()
}]}
