import jenkins.model.*
import java.net.URI


void copyToRemote(URI uri, String credentialId, String source, String target) {
    String remoteTarget = "${uri.getUserInfo()}@${uri.getHost()}:${target}".toString()
    sshagent(credentials: [credentialId]) {
        sh "scp -o StrictHostKeyChecking=no -P ${uri.getPort()} ${source} ${remoteTarget}"
    }
}


class Context {
    URI target
    String content
    String file

    String buildNode
    URI[] deployTargets
    String deployCredentialId

}


void updateElectronVersion(Context context) {
    // create version file
    writeFile file: context.file, text: context.content, encoding: 'utf-8'
    // build remote path
    // copy version file to remote
    parallel context.deployTargets.collectEntries { deployTarget -> [deployTarget.toString(), {
        String remoteTargetDir = "${deployTarget.getPath()}/${context.target.getHost().split('\\.')[0]}".toString()
        copyToRemote(deployTarget, context.deployCredentialId, context.file, remoteTargetDir)
    }]}
}


Context context = new Context(
    target: new URI(params.TARGET),
    content: params.CONTENT,
    file: params.FILE,
    buildNode: params.BUILD_NODE ?: env.BUILD_NODE,
    deployTargets: params.DEPLOY_TARGETS.trim().split('\n').collect{ new URI(it) },
    deployCredentialId: params.DEPLOY_CREDENTIAL,
)


node (context.buildNode) {
    updateElectronVersion(context)
}
