import jenkins.model.*
import java.net.URI

class Context {
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

// Get started!
Context context = new Context(
    buildNode                   : params.BUILD_NODE?: env.BUILD_NODE,
    buildUrl                    : env.BUILD_URL,

    nodejsTool                  : params.NODEJS_TOOL,
    npmRegistry                 : params.NPM_REGISTRY,

    scmCredentialId             : params.SCM_CREDENTIAL,
    gitlabSourceBranch          : env.gitlabSourceBranch,
    gitlabTargetBranch          : env.gitlabTargetBranch,
    gitlabSourceNamespace       : env.gitlabSourceNamespace,
    gitlabTargetNamespace       : env.gitlabTargetNamespace,
    gitlabSourceRepoSshURL      : env.gitlabSourceRepoSshURL,
    gitlabTargetRepoSshURL      : env.gitlabTargetRepoSshURL,
    gitlabUserEmail             : env.gitlabUserEmail,
    gitlabMergeRequestLastCommit: env.gitlabMergeRequestLastCommit,

    deployCredentialId          : params.DEPLOY_CREDENTIAL,
    deployUri                   : new URI(params.DEPLOY_CREDENTIAL),
    deployBaseDir               : params.DEPLOY_BASE_DIR,

    rcCredentialId              : params.E2E_RC_CREDENTIAL,
    e2eSiteEnv                  : params.E2E_SITE_ENV,
    e2eSeleniumServer           : params.E2E_SELENIUM_SERVER,
    e2eBrowsers                 : params.E2E_BROWSERS,
    e2eConcurrency              : params.E2E_CONCURRENCY,
    e2eExcludeTags              : params.E2E_EXCLUDE_TAGS?: '',
    e2eEnableRemoteDashboard    : params.E2E_ENABLE_REMOTE_DASHBOARD,
    e2eEnableMockServer         : params.E2E_ENABLE_MOCK_SERVER,
)

context.gitlabSourceBranch     = context.gitlabSourceBranch?: params.GITLAB_BRANCH
context.gitlabTargetBranch     = context.gitlabTargetBranch?: context.gitlabSourceBranch
context.gitlabSourceNamespace  = context.gitlabSourceNamespace?: params.GITLAB_NAMESPACE
context.gitlabTargetNamespace  = context.gitlabTargetNamespace?: context.gitlabSourceNamespace
context.gitlabSourceRepoSshURL = context.gitlabSourceRepoSshURL?: params.GITLAB_SSH_URL
context.gitlabTargetRepoSshURL = context.gitlabTargetRepoSshURL?: context.gitlabSourceRepoSshURL


