import jenkins.model.*
import java.net.URI

class Context {
    // jupiter
    final static String domain = 'fiji.gliprc.com'
    final static String releaseBranch = 'master'
    final static String integrationBranch = 'develop'

    static Boolean isStableBranch(String branch) {
        branch ==~ /^(develop)|(master)|(release.*)|(stage.*)|(hotfix.*)$/
    }

    static Boolean isIntegrationBranch(String branch) {
        branch == integrationBranch
    }

    static Boolean isReleaseBranch(String branch) {
        branch == releaseBranch
    }

    // jenkins
    String buildNode
    String buildUrl

    // gitlab
    String scmCredentialId
    String gitlabSourceBranch
    String gitlabTargetBranch
    String gitlabSourceNamespace
    String gitlabTargetNamespace
    String gitlabSourceRepoSshURL
    String gitlabTargetRepoSshURL
    String gitlabUserEmail
    String gitlabMergeRequestLastCommit

    // nodejs
    String nodejsTool
    String npmRegistry

    // deployment
    URI deployUri
    String deployCredentialId
    String deployBaseDir

    // automation
    String rcCredentialId
    String e2eSiteEnv
    String e2eSeleniumServer
    String e2eBrowsers
    String e2eConcurrency
    String e2eExcludeTags
    Boolean e2eEnableRemoteDashboard
    Boolean e2eEnableMockServer

    // runtime
    String appHeadSha = null
    String juiHeadSha = null
    String rcuiHeadSha = null

    Boolean getIsMerge() {
        gitlabSourceBranch != gitlabTargetBranch
    }

    Boolean getIsSkipEndToEnd() {
        !isStableBranch(gitlabSourceBranch) && !isStableBranch(gitlabTargetBranch)
    }

    Boolean getIsSkipUpdateGitlabStatus() {
        !isMerge && ! isIntegrationBranch(gitlabTargetBranch)
    }

    Boolean getIsBuildRelease() {
        isReleaseBranch(gitlabSourceBranch) ||
            isReleaseBranch(gitlabTargetBranch) ||
            gitlabSourceBranch ==~ /.*release.*/ ||
            gitlabTargetBranch ==~ /.*release.*/
    }

    String getSubDomain() {
        String subDomain = gitlabSourceBranch.replaceAll(/[\/\.]/, '-').toLowerCase()
        if (!isMerge) {
            if (isReleaseBranch(gitlabSourceBranch))
                return 'release'
            if (gitlabSourceBranch in ['develop', 'stage'])
                return gitlabSourceBranch
            return subDomain
        }
        return "mr-${subDomain}".toString()
    }

    String getAppStageLinkDir() {
        "${deployBaseDir}/stage".toString()
    }

    String getAppLinkDir() {
        "${deployBaseDir}/${subDomain}".toString()
    }

    String getJuiLinkDir() {
        "${deployBaseDir}/${subDomain}-jui".toString()
    }

    String getRcuiLinkDir() {
        "${deployBaseDir}/${subDomain}-rcui".toString()
    }

    String getAppUrl() {
        "https://${subDomain}.${domain}".toString()
    }

    String getJuiUrl() {
        "https://${subDomain}-jui.${domain}".toString()
    }

    String getRcuiUrl() {
        "https://${subDomain}-rcui.${domain}".toString()
    }

    String getAppHeadShaTarball() {
        "${deployBaseDir}/app${isBuildRelease? '-release' : ''}-${appHeadSha}.tar.gz".toString()
    }

    String getJuiHeadShaTarball() {
        "${deployBaseDir}/jui-${juiHeadSha}.tar.gz".toString()
    }

    String getRcuiHeadShaTarball() {
        "${deployBaseDir}/rcui-${rcuiHeadSha}.tar.gz".toString()
    }
}






