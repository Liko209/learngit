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
    String appHeadHash
    String juiHeadHash
    String rcuiHeadHash

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

    String getMessageChannel() {
        if (isMerge)
            return "jupiter_mr_ci@ringcentral.glip.com"
        switch (gitlabSourceBranch) {
            case "master": return "jupiter_master_ci@ringcentral.glip.com"
            case "develop": return "jupiter_develop_ci@ringcentral.glip.com"
            default: return "jupiter_push_ci@ringcentral.glip.com"
        }
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

    String getAppHeadHashDir() {
        "${deployBaseDir}/app${isBuildRelease? '-release' : ''}-${appHeadHash}".toString()
    }

    String getJuiHeadHashDir() {
        "${deployBaseDir}/jui-${juiHeadHash}".toString()
    }

    String getRcuiHeadHashDir() {
        "${deployBaseDir}/rcui-${rcuiHeadHash}".toString()
    }
}

class BaseJob {
    def jenkins

    // abstract method
    void addFailedStage(String name) {}

    // jenkins utils
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

    void mail(addresses, String subject, String body) {
        jenkins.echo addresses.join(',')
        addresses.each {
            try {
                jenkins.mail to: it, subject: subject, body: body
            } catch (e) { println e }
        }
    }

    // git utils
    String getStableHash(String treeish) {
        String cmd = "git cat-file commit ${treeish} | grep -e ^tree | cut -d ' ' -f 2".toString()
        jenkins.sh(returnStdout: true, script: cmd).trim()
    }

    // ssh utils
    String ssh(URI remoteUri, String cmd) {
        String sshCmd = "ssh -q -o StrictHostKeyChecking=no -p ${remoteUri.getPort()?: 22} ${remoteUri.getUserInfo()}@${remoteUri.getHost()}".toString()
        jenkins.sh(returnStdout: true, script: "${sshCmd} \"${cmd}\"").trim()
    }

    void scp(String source, URI targetUri, String target) {
        String remoteTarget = "${targetUri.getUserInfo()}@${targetUri.getHost()}:${target}".toString()
        sh "scp -o StrictHostKeyChecking=no -P ${targetUri.getPort()} ${source} ${remoteTarget}"
    }

    void deployToRemote(String sourceDir, URI targetUri, String targetDir) {
        deployToRemote(sourceDir, targetUri, targetDir, "tmp-${Math.random()}.tar.gz".toString())
    }

    void deployToRemote(String sourceDir, URI targetUri, String targetDir, String tarball) {
        jenkins.sh "tar -czvf ${tarball} -C ${sourceDir} ."  // pack
        ssh(targetUri, "rm -rf ${targetDir} || true && mkdir -p ${targetDir}".toString())  // clean target dir
        scp(tarball, targetUri, targetDir)
        ssh(targetUri, "tar -xvf ${targetDir}/${tarball} -C ${targetDir} && rm ${targetDir}/${tarball}".toString()) // unpack and clean
    }

    // ssh based distributed file lock

}

class JupiterJob extends BaseJob {
    final static String DEPENDENCY_LOCK = 'dependency.lock'

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

    void checkout() {
        jenkins.checkout ([
            $class: 'GitSCM',
            branches: [[name: "${context.gitlabSourceNamespace}/${context.gitlabSourceBranch}"]],
            extensions: [
                [$class: 'PruneStaleBranch'],
                [
                    $class: 'PreBuildMerge',
                    options: [
                        fastForwardMode: 'FF',
                        mergeRemote: context.gitlabTargetNamespace,
                        mergeTarget: context.gitlabTargetBranch,
                    ]
                ]
            ],
            userRemoteConfigs: [
                [
                    credentialsId: context.scmCredentialId,
                    name: context.gitlabTargetNamespace,
                    url: context.gitlabTargetRepoSshURL,
                ],
                [
                    credentialsId: context.scmCredentialId,
                    name: context.gitlabSourceNamespace,
                    url: context.gitlabSourceRepoSshURL,
                ]
            ]
        ])
        // keep node_modules to speed up build process
        // keep a lock file to help us decide if we need to upgrade dependencies
        jenkins.sh "git clean -xdf -e node_modules -e ${DEPENDENCY_LOCK}"

        // update runtime context
        // change in tests and autoDevOps directory should not trigger application build
        // for git 1.9, there is an easy way to exclude files
        // but most slaves are centos, whose git's version is still 1.8, we use a cmd pipeline here for compatibility
        // the reason to use stableSha here is if HEAD is generate via fast-forward, the commit will be changed when re-running the job due to timestamp changed
        context.appHeadHash = getStableHash(
            jenkins.sh(returnStdout: true, script: '''ls -1 | grep -Ev '^(tests|autoDevOps)$' | tr '\\n' ' ' | xargs git rev-list -1 HEAD -- ''').trim()
        )

        context.juiHeadHash = getStableHash(
            jenkins.sh(returnStdout: true, script: '''git rev-list -1 HEAD -- packages/jui''').trim()
        )

        context.rcuiHeadHash = getStableHash(
            jenkins.sh(returnStdout: true, script: '''git rev-list -1 HEAD -- packages/rcui''').trim()
        )
    }

    void run() {
        context.isSkipUpdateGitlabStatus || jenkins.updateGitlabCommitStatus(name: 'jenkins', state: 'running')
        cancelOldBuildOfSameCause()

        jenkins.node(context.buildNode) {
            String nodejsHome = jenkins.tool context.nodejsTool
            jenkins.withEnv([
                "PATH+NODEJS=${nodejsHome}/bin",
                'TZ=UTC-8',
                'SENTRYCLI_CDNURL=https://cdn.npm.taobao.org/dist/sentry-cli',
            ]) {
                stage(name: 'collect facts'){ collectFacts() }
                stage(name: 'checkout'){ checkout() }
            }
        }
        jenkins.echo context.dump()
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
