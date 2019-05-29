import jenkins.model.*
import com.dabsquared.gitlabjenkins.cause.GitLabWebHookCause
import java.net.URI

class Context {
    final static String SUCCESS_EMOJI  = ':white_check_mark:'
    final static String FAILURE_EMOJI  = ':negative_squared_cross_mark:'
    final static String ABORTED_EMOJI  = ':no_entry:'
    final static String UPWARD_EMOJI   = ':chart_with_upwards_trend:'
    final static String DOWNWARD_EMOJI = ':chart_with_downwards_trend:'

    final static String DOMAIN             = 'fiji.gliprc.com'
    final static String RELEASE_BRANCH     = 'master'
    final static String INTEGRATION_BRANCH = 'develop'

    static Boolean isStableBranch(String branch) {
        branch ==~ /^(develop)|(master)|(release.*)|(stage.*)|(hotfix.*)$/
    }

    static Boolean isIntegrationBranch(String branch) {
        branch == INTEGRATION_BRANCH
    }

    static Boolean isReleaseBranch(String branch) {
        branch == RELEASE_BRANCH
    }

    static String tagToGlipLink(String text) {
        text.replaceAll(/<a\b[^>]*?href="(.*?)"[^>]*?>(.*?)<\/a>/, '[$2]($1)')
    }

    static String tagToUrl(String text) {
        text.replaceAll(/<a\b[^>]*?href="(.*?)"[^>]*?>(.*?)<\/a>/, '$1')
    }

    static String urlToTag(String url) {
        """<a href="${url}">${url}</a>""".toString()
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
    String feedbackUrl

    // runtime
    String appHeadSha
    String juiHeadSha
    String rcuiHeadSha

    List<String> failedStages = [] as List<String>

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
        "https://${subDomain}.${DOMAIN}".toString()
    }

    String getJuiUrl() {
        "https://${subDomain}-jui.${DOMAIN}".toString()
    }

    String getRcuiUrl() {
        "https://${subDomain}-rcui.${DOMAIN}".toString()
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

class BaseJob {
    def jenkins

    void addFailedStage(String name) {}

    void cancelOldBuildOfSameCause() {
        GitLabWebHookCause currentBuildCause = jenkins.currentBuild.rawBuild.getCause(GitLabWebHookCause.class)
        if (null == currentBuildCause)
            return
        def currentCauseData = currentBuildCause.getData()

        jenkins.currentBuild.rawBuild.getParent().getBuilds().each { build ->
            if (!build.isBuilding() || jenkins.currentBuild.rawBuild.getNumber() <= build.getNumber())
                return
            GitLabWebHookCause cause = build.getCause(GitLabWebHookCause.class)
            if (null == cause)
                return
            def causeData = cause.getData()

            if (currentCauseData.sourceBranch == causeData.sourceBranch
                && currentCauseData.sourceRepoName == causeData.sourceRepoName
                && currentCauseData.targetBranch == causeData.targetBranch
                && currentCauseData.targetRepoName == causeData.targetRepoName) {
                build.doStop()
                jenkins.echo "build ${build.getFullDisplayName()} is terminated"
            }
        }
    }

    def stage(Map args, Closure block) {
        assert args.name, 'stage name is required'
        String  name     = args.name
        int     time  = (null == args.timeout) ? 1800: args.timeout
        Boolean activity = (null == args.activity) ? true: args.activity
        jenkins.timeout(time: time, activity: activity, unit: 'SECONDS') {
            try {
                jenkins.stage(name, block)
            } catch (e) {
                addFailedStage(name)
                throw e
            }
        }
    }

}

class JupiterJob extends BaseJob {
    Context context

    void addFailedStage(String name) {
        context.failedStages.add(name)
    }

    void collectFacts() {
        jenkins.sh 'env'
        jenkins.sh 'df -h'
        jenkins.sh 'uptime'
        jenkins.sh 'git --version'
        jenkins.sh 'node -v'
        jenkins.sh 'rsync --version'
        jenkins.sh 'grep --version'
        jenkins.sh 'which tr'
        jenkins.sh 'which xargs'

        // clean npm cache when its size exceed 6G, the unit of default du command is K, so we need to >> 20 to get G
        long npmCacheSize = Long.valueOf(jenkins.sh(returnStdout: true, script: 'du -s $(npm config get cache) | cut -f1').trim()) >> 20
        if (npmCacheSize > 6) {
            jenkins.sh 'npm cache clean --force'
        }
    }

    void run() {
        cancelOldBuildOfSameCause()
        jenkins.node(context.buildNode) {
            stage(name: 'collect facts'){ collectFacts() }
        }
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

    feedbackUrl                 : params.FEEDBACK_URL,
)

context.gitlabSourceBranch     = context.gitlabSourceBranch?: params.GITLAB_BRANCH
context.gitlabTargetBranch     = context.gitlabTargetBranch?: context.gitlabSourceBranch
context.gitlabSourceNamespace  = context.gitlabSourceNamespace?: params.GITLAB_NAMESPACE
context.gitlabTargetNamespace  = context.gitlabTargetNamespace?: context.gitlabSourceNamespace
context.gitlabSourceRepoSshURL = context.gitlabSourceRepoSshURL?: params.GITLAB_SSH_URL
context.gitlabTargetRepoSshURL = context.gitlabTargetRepoSshURL?: context.gitlabSourceRepoSshURL


JupiterJob job = new JupiterJob(jenkins: this, context: context)
job.run()
