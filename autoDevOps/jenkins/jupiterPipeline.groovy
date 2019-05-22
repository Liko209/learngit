import jenkins.model.*
import java.net.URI
import com.dabsquared.gitlabjenkins.cause.GitLabWebHookCause

class BaseJob {
    def jenkins

    // cancel old build to safe slave resources
    @NonCPS
    void cancelOldBuildOfSameCause() {
        GitLabWebHookCause currentBuildCause = jenkins.currentBuild.rawBuild.getCause(jenkins.GitLabWebHookCause.class)
        if (null == currentBuildCause)
            return
        def currentCauseData = currentBuildCause.getData()

        jenkins.currentBuild.rawBuild.getParent().getBuilds().each { build ->
            if (!build.isBuilding() || jenkins.currentBuild.rawBuild.getNumber() <= build.getNumber())
                return
            GitLabWebHookCause cause = build.getCause(jenkins.GitLabWebHookCause.class)
            if (null == cause)
                return
            def causeData = cause.getData()
            if (currentCauseData.sourceBranch == causeData.sourceBranch
                && currentCauseData.sourceRepoName == causeData.sourceRepoName
                && currentCauseData.targetBranch == causeData.targetBranch
                && currentCauseData.targetRepoName == causeData.targetRepoName) {
                build.doStop()
                jenkins.echo "build ${build.getFullDisplayName()} is canceled"
            }
        }
    }
    
    // conditional stage
    void condStage(Map args, Closure block) {
        assert args.name, 'stage name is required'
        String  name     = args.name
        Integer time     = (null == args.timeout) ? 1800 : args.timeout
        Boolean activity = (null == args.activity) ? true: args.activity
        jenkins.timeout(time: time, activity: activity, unit: 'SECONDS') {
            jenkins.stage(name, block)
        }
    }

    // get stable key from a git treeish object, ensure stability by only taking tree object into account
    String stableSha1(String treeish) {
        String cmd = "git cat-file commit ${treeish} | grep -e ^tree | cut -d ' ' -f 2".toString()
        jenkins.sh(returnStdout: true, script: cmd).trim()
    }

    // ssh helper
    String sshCmd(String remoteUri, String cmd) {
        URI uri = new URI(remoteUri)
        GString sshCmd = "ssh -q -o StrictHostKeyChecking=no -p ${uri.getPort()} ${uri.getUserInfo()}@${uri.getHost()}"
        jenkins.sh(returnStdout: true, script: "${sshCmd} \"${cmd}\"").trim()
    }

    // FIXME: move to Jupiter Job
    // deploy helper
    void rsyncFolderToRemote(String sourceDir, String remoteUri, String remoteDir) {
        URI uri = new URI(remoteUri)
        sshCmd(remoteUri, "mkdir -p ${remoteDir}".toString())
        String rsyncRemoteUri = "${uri.getUserInfo()}@${uri.getHost()}:${remoteDir}".toString()
        jenkins.sh "rsync -azPq --delete --progress -e 'ssh -o StrictHostKeyChecking=no -p ${uri.getPort()}' ${sourceDir} ${rsyncRemoteUri}"
        sshCmd(remoteUri, "chmod -R 755 ${remoteDir}".toString())
    }

    // FIXME: move to Jupiter Job
    void rsyncFolderRemoteToRemote(String fromRemoteUri, String fromRemoteDir, String toRemoteUri, String toRemoteDir) {
        URI fromUri = new URI(fromRemoteUri)
        String from = "${fromUri.getUserInfo()}@${fromUri.getHost()}:${fromRemoteDir}".toString()
        sshCmd(toRemoteUri, "scp -r -P ${fromUri.getPort()} ${from} ${toRemoteDir}".toString())
        sshCmd(toRemoteUri, "chmod -R 755 ${toRemoteDir}".toString())
    }

    Boolean doesRemoteDirectoryExist(String remoteUri, String remoteDir) {
        // the reason to use stdout instead of return code is,
        // by return code we can not tell the error of ssh itself or dir not exists
        'true' == sshCmd(remoteUri, "[ -d ${remoteDir} ] && echo 'true' || echo 'false'".toString()).trim()
    }

    // FIXME: move to Jupiter Job
    def updateRemoteCopy(String remoteUri, String linkSource, String linkTarget) {
        updateRemoteCopy(remoteUri, linkSource, linkTarget, true)
    }

    // FIXME: move to Jupiter Job
    def updateRemoteCopy(String remoteUri, String linkSource, String linkTarget, Boolean delete) {
        assert '/' != linkTarget, 'What the hell are you doing?'
        if (delete) {
            // remove link if exists
            jenkins.println sshCmd(remoteUri, "[ -L ${linkTarget} ] && unlink ${linkTarget} || true")
            // remote directory if exists
            jenkins.println sshCmd(remoteUri, "[ -d ${linkTarget} ] && rm -rf ${linkTarget} || true")
        }
        // ensure target directory existed
        jenkins.println sshCmd(remoteUri, "mkdir -p ${linkTarget}")
        // create copy to new target
        jenkins.println sshCmd(remoteUri, "cp -rf ${linkSource}/* ${linkTarget}/")
    }

    // FIXME: move to Jupiter Job
    void updateVersionInfo(String remoteUri, String appDir, String sha, long timestamp) {
        String cmd = "sed -i 's/{{deployedCommit}}/${sha.substring(0,9)}/;s/{{deployedTime}}/${timestamp}/' ${appDir}/static/js/versionInfo.*.chunk.js || true"
        sshCmd(remoteUri, cmd)
    }


    // FIXME: move to Jupiter Job
    // FIXME:
    static String getMessageChannel(String sourceBranch, String targetBranch) {
        if (null != targetBranch && sourceBranch != targetBranch)
            return "jupiter_mr_ci@ringcentral.glip.com"
        switch (sourceBranch) {
            case "master": return "jupiter_master_ci@ringcentral.glip.com"
            case "develop": return "jupiter_develop_ci@ringcentral.glip.com"
            default: return "jupiter_push_ci@ringcentral.glip.com"
        }
    }

    void safeMail(addresses, subject, body) {
        try {
            // use bcc to avoid create glip group
            jenkins.mail to: addresses[0], bcc: addresses.join(','), subject: subject, body: body
        } catch (e) {
            jenkins.println e
        }
    }

    // FIXME: move to context
    static def isStableBranch(String branchName) {
        if (null == branchName)
            return false
        return branchName ==~ /^(develop)|(master)|(release.*)|(stage.*)|(hotfix.*)$/
    }

    static def aTagToGlipLink(String html) {
        return html.replaceAll(/<a\b[^>]*?href="(.*?)"[^>]*?>(.*?)<\/a>/, '[$2]($1)')
    }

    // FIXME: move to Jupiter Job
    static def formatGlipReport(report) {
        List lines = []
        if (null != report.buildResult)
            lines.push("**Build Result**: ${report.buildResult}")
        if (null != report.description)
            lines.push("**Description**: ${aTagToGlipLink(report.description)}")
        if (null != report.jobUrl)
            lines.push("**Job URL**: ${report.jobUrl}")
        if (null != report.saReport)
            lines.push("**Static Analysis**: ${report.saReport}")
        if (null != report.coverage)
            lines.push("**Coverage Report**: ${report.coverage}")
        if (null != report.coverageDiff)
            lines.push("**Coverage Changes**: ${report.coverageDiff}")
        if (null != report.coverageDiffDetail)
            lines.push("**Coverage Changes Detail**: ${report.coverageDiffDetail}")
        if (null != report.appUrl)
            lines.push("**Application URL**: ${report.appUrl}")
        if (null != report.juiUrl)
            lines.push("**Storybook URL**: ${report.juiUrl}")
        if (null != report.publishUrl)
            lines.push("**Package URL**: ${report.publishUrl}")
        if (null != report.e2eUrl)
            lines.push("**E2E Report**: ${report.e2eUrl}")
        return lines.join(' \n')
    }

    static def urlToATag(String url) {
        return """<a href="${url}">${url}</a>""".toString()
    }


    // FIXME: move to Jupiter Job
    static def formatJenkinsReport(report) {
        List lines = []
        if (null != report.description)
            lines.push("Description: ${report.description}")
        if (null != report.saReport)
            lines.push("Static Analysis: ${report.saReport}")
        if (null != report.coverageDiff)
            lines.push("Coverage Changes: ${report.coverageDiff}")
        if (null != report.appUrl)
            lines.push("Application URL: ${urlToATag(report.appUrl)}")
        if (null != report.juiUrl)
            lines.push("Storybook URL: ${urlToATag(report.juiUrl)}")
        if (null != report.publishUrl)
            lines.push("Package URL: ${urlToATag(report.publishUrl)}")
        if (null != report.e2eUrl)
            lines.push("E2E Report: ${urlToATag(report.e2eUrl)}")
        return lines.join('<br>')
    }

    // FIXME: move to Jupiter Job
    String getPackageJsonVersion() {
        jenkins.sh "git ls-files | grep package.json | grep -v tests | tr '\\n' ' ' | xargs git rev-list -1 HEAD -- | xargs git cat-file commit | grep -e ^tree | cut -d ' ' -f 2"
    }
}


class JupiterPipelineParam {

    // job params
    String buildNode
    String scmCredentialId
    String npmRegistry
    String nodejsTool
    String deployUri
    String deployCredentialId
    String deployBaseDir
    String e2eRcCredentialId
    String dockerDeployUri
    String dockerDeployCredentialId
    String dockerDeployBaseDir
    String releaseBranch = 'master'
    String stageBranch = 'stage'
    String integrationBranch = 'develop'

    // gitlab params
    String buildUrl
    String gitlabSourceBranch
    String gitlabTargetBranch
    String gitlabSourceNamespace
    String gitlabTargetNamespace
    String gitlabSourceRepoSshURL
    String gitlabTargetRepoSshURL
    String gitlabUserEmail
    String gitlabMergeRequestLastCommit

    // e2e params
    String e2eSiteEnv
    String e2eSeleniumServer
    String e2eBrowsers
    String e2eConcurrency
    String e2eExcludeTags
    Boolean e2eEnableRemoteDashboard
    Boolean e2eEnableMockServer



    Boolean isMerge() {
        gitlabSourceBranch != gitlabTargetBranch
    }

    String getSubDomain() {
        if (gitlabSourceBranch in [releaseBranch,])
            return 'release'
        if (gitlabSourceBranch in [integrationBranch, stageBranch])
            return gitlabSourceBranch
        String domain = sourceBranch.replaceAll(/[\/\.]/, '-').toLowerCase()
        if (isMerge())
            return "mr-${domain}".toString()
        return domain
    }

    String getAppLinkDir() {
        "${deployBaseDir}/${subDomain}".toString()
    }

    String getAppStageLinkDir() {
        "${deployBaseDir}/stage".toString()
    }

    String getJuiLinkDir() {
        "${deployBaseDir}/${subDomain}-jui".toString()
    }

    String getAppUrl() {
        "https://${subDomain}.fiji.gliprc.com".toString()
    }

    String getJuiUrl() {
        "https://${subDomain}-jui.fiji.gliprc.com".toString()
    }


    JupiterPipelineParam(script) {
        def params = script.params
        def env = script.env

        // jenkins params
        buildNode = params.BUILD_NODE ?: env.BUILD_NODE
        buildUrl = env.BUILD_URL

        npmRegistry = params.NPM_REGISTRY
        nodejsTool = params.NODEJS_TOOL
        deployUri = params.DEPLOY_URI
        deployCredentialId = params.DEPLOY_CREDENTIAL
        deployBaseDir = params.DEPLOY_BASE_DIR

        // gitlab params
        scmCredentialId = params.SCM_CREDENTIAL
        gitlabSourceBranch = env.gitlabSourceBranch?: params.GITLAB_BRANCH
        gitlabTargetBranch = env.gitlabTargetBranch?: gitlabSourceBranch
        gitlabSourceNamespace = env.gitlabSourceNamespace?: params.GITLAB_NAMESPACE
        gitlabTargetNamespace = env.gitlabTargetNamespace?: gitlabSourceNamespace
        gitlabSourceRepoSshURL = env.gitlabSourceRepoSshURL?: params.GITLAB_SSH_URL
        gitlabTargetRepoSshURL = env.gitlabTargetRepoSshURL?: gitlabSourceRepoSshURL
        gitlabUserEmail = env.gitlabUserEmail
        gitlabMergeRequestLastCommit = env.gitlabMergeRequestLastCommitbuildUrl

        // e2e params
        e2eRcCredentialId = params.E2E_RC_CREDENTIAL
        e2eSiteEnv = params.E2E_SITE_ENV
        e2eSeleniumServer = params.E2E_SELENIUM_SERVER
        e2eBrowsers = params.E2E_BROWSERS
        e2eConcurrency = params.E2E_CONCURRENCY
        e2eExcludeTags = params.E2E_EXCLUDE_TAGS?: ''
        e2eEnableRemoteDashboard = params.E2E_ENABLE_REMOTE_DASHBOARD
        e2eEnableMockServer = params.E2E_ENABLE_MOCK_SERVER
    }
}

class JupiterPipelineContext {
    def script
    BaseJob util
    Map report = [:]
    JupiterPipelineParam param
    def reportChannels

    String headSha = null
    String appHeadSha = null
    String juiHeadSha = null

    String appHeadShaDir
    String juiHeadShaDir

    /* build strategy */
    Boolean isMerge
    // skip e2e when neither source or target branch is stable branch.
    // won't skip e2e when configuration file of source branch exists
    Boolean skipEndToEnd
    // update status for merge request event and new push on stable branch
    Boolean skipUpdateGitlabStatus
    // create release build when targetBranch match specific name pattern
    Boolean buildRelease

    // by default we should not skip building app and jui
    Boolean skipBuildApp = false
    Boolean skipBuildJui = false
    Boolean skipSaAndUt = false
    Boolean skipInstallDependencies = false

    // glip emoji const set
    final String SUCCESS_EMOJI = ':white_check_mark:'
    final String FAILURE_EMOJI = ':negative_squared_cross_mark:'
    final String ABORTED_EMOJI = ':no_entry:'
    final String UPWARD_EMOJI = ':chart_with_upwards_trend:'
    final String DOWNWARD_EMOJI = ':chart_with_downwards_trend:'

    JupiterPipelineContext(script) {
        this.script = script
        this.init()
    }

    private void init() {
        util = new BaseJob(jenkins: script)
        param = new JupiterPipelineParam(script)

        appHeadShaDir = "${param.deployBaseDir}/app-${buildRelease ? 'release-' : ''}".toString()
        juiHeadShaDir = "${param.deployBaseDir}/jui-".toString()

        reportChannels = [
            BaseJob.getMessageChannel(param.gitlabSourceBranch, param.gitlabTargetBranch)
        ]
        // send report to owner if gitlabUserEmail is provided
        if (param.gitlabUserEmail) {
            reportChannels.push(param.gitlabUserEmail)
            reportChannels.push(param.gitlabUserEmail.replaceAll('ringcentral.com', 'ringcentral.glip.com'))
        }

        isMerge = param.gitlabSourceBranch != param.gitlabTargetBranch
        skipEndToEnd = !BaseJob.isStableBranch(param.gitlabSourceBranch) && !BaseJob.isStableBranch(param.gitlabTargetBranch)
        skipUpdateGitlabStatus = !isMerge && param.integrationBranch != param.gitlabTargetBranch
        buildRelease = (param.gitlabTargetBranch.startsWith('release') || param.gitlabTargetBranch.endsWith('release')
            || param.releaseBranch == param.gitlabTargetBranch)

        report.buildUrl = param.buildUrl
    }

}

abstract class JupiterPipelineStage {
    
    JupiterPipelineContext context
    JupiterPipelineStage next

    //some object in context
    BaseJob util
    def script
    Map report
    JupiterPipelineParam param
    def reportChannels

    JupiterPipelineStage(JupiterPipelineContext context) {
        this.context = context
        this.util = context.util
        this.script = context.script
        this.report = context.report
        this.param = context.param
        this.reportChannels = context.reportChannels
    }

    JupiterPipelineStage next(next) {
        this.next = next
        return next
    }

    final void run() {
        resolve()
        if(next != null) {
            next.run()
        }
    }

    protected abstract void resolve();
}

class CollectFactsStage extends JupiterPipelineStage {

    CollectFactsStage(JupiterPipelineContext context) {
        super(context)
    }

    void resolve() {
        script.stage ('Collect Facts') {
            script.sh 'env'
            script.sh 'df -h'
            script.sh 'uptime'
            script.sh 'git --version'
            script.sh 'node -v'
            script.sh 'rsync --version'
            script.sh 'grep --version'
            script.sh 'which tr'
            script.sh 'which xargs'

            // clean npm cache when its size exceed 10G, the unit of default du command is K, so we need to right-shift 20 to get G
            long npmCacheSize = Long.valueOf(script.sh(returnStdout: true, script: 'du -s $(npm config get cache) | cut -f1').trim()) >> 20
            if (npmCacheSize > 6) {
                script.sh 'npm cache clean --force'
            }
        }
    }
}

class CheckoutStage extends JupiterPipelineStage {

    CheckoutStage(JupiterPipelineContext context) {
        super(context)
    }

    void resolve() {
        script.checkout ([
            $class: 'GitSCM',
            branches: [[name: "${param.gitlabSourceNamespace}/${param.gitlabSourceBranch}"]],
            extensions: [
                [$class: 'PruneStaleBranch'],
                [
                    $class: 'PreBuildMerge',
                    options: [
                        fastForwardMode: 'FF',
                        mergeRemote: param.gitlabTargetNamespace,
                        mergeTarget: param.gitlabTargetBranch,
                    ]
                ]
            ],
            userRemoteConfigs: [
                [
                    credentialsId: param.scmCredentialId,
                    name: param.gitlabTargetNamespace,
                    url: param.gitlabTargetRepoSshURL,
                ],
                [
                    credentialsId: param.scmCredentialId,
                    name: param.gitlabSourceNamespace,
                    url: param.gitlabSourceRepoSshURL
                ]
            ]
        ])
    }
}

class PostCheckoutStage extends JupiterPipelineStage {

    PostCheckoutStage(JupiterPipelineContext context) {
        super(context)
    }

    void resolve() {
        // keep node_modules to speed up build process
        script.sh 'git clean -xdf'
        // sh 'git clean -xdf -e node_modules'
        // get head sha
        context.headSha = script.sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
        // change in tests and autoDevOps directory should not trigger application build
        // for git 1.9, there is an easy way to exclude files
        // but most slaves are centos, whose git's version is still 1.8, we use a cmd pipeline here for compatibility
        context.appHeadSha = script.sh(returnStdout: true, script: '''ls -1 | grep -Ev '^(tests|autoDevOps)$' | tr '\\n' ' ' | xargs git rev-list -1 HEAD -- ''').trim()
        if (context.isMerge && context.headSha == context.appHeadSha) {
            // the reason to use stableSha here is if HEAD is generate via fast-forward, the commit will be changed when re-running the job due to timestamp changed
            script.echo "generate stable sha1 key from ${context.appHeadSha}"
            context.appHeadSha = script.stableSha1(context.appHeadSha)
        }

        script.echo "appHeadSha=${context.appHeadSha}"
        assert context.appHeadSha, 'appHeadSha is invalid'
        context.appHeadShaDir += context.appHeadSha
        script.echo "appHeadShaDir=${context.appHeadShaDir}"
        // build jui only when packages/jui has change
        context.juiHeadSha = script.sh(returnStdout: true, script: '''git rev-list -1 HEAD -- packages/jui''').trim()
        if (context.isMerge && context.headSha == context.juiHeadSha) {
            // same as appHeadSha
            script.echo "generate stable sha1 key from ${context.juiHeadSha}"
            context.juiHeadSha = util.stableSha1(context.juiHeadSha)
        }
        script.echo "juiHeadSha=${context.juiHeadSha}"
        assert context.juiHeadSha, 'juiHeadSha is invalid'
        context.juiHeadShaDir += context.juiHeadSha
        script.echo "juiHeadShaDir=${context.juiHeadShaDir}"

        // check if app or jui has been built
        script.sshagent(credentials: [param.deployCredentialId]) {
            // we should always build release version
            context.skipBuildApp = util.doesRemoteDirectoryExist(param.deployUri, context.appHeadShaDir)
            context.skipBuildJui = util.doesRemoteDirectoryExist(param.deployUri, context.juiHeadShaDir)
        }

        if (!context.skipBuildApp && !context.skipBuildJui) {
            String dockerAppHeadShaDir = "${param.dockerDeployBaseDir}/app-${context.buildRelease ? 'release-' : ''}${context.appHeadSha}".toString()
            String dockerJuiHeadShaDir = "${param.dockerDeployBaseDir}/jui-${context.juiHeadSha}".toString()

            script.sshagent(credentials: [param.dockerDeployCredentialId]) {
                // we should always build release version
                context.skipBuildApp = util.doesRemoteDirectoryExist(param.dockerDeployUri, dockerAppHeadShaDir)
                context.skipBuildJui = util.doesRemoteDirectoryExist(param.dockerDeployUri, dockerJuiHeadShaDir)
            }

            script.sshagent(credentials: [param.deployCredentialId]) {
                if (context.skipBuildApp) {
                    util.rsyncFolderRemoteToRemote(param.dockerDeployUri, dockerAppHeadShaDir, param.deployUri, context.appHeadShaDir)
                }
                if (context.skipBuildJui) {
                    util.rsyncFolderRemoteToRemote(param.dockerDeployUri, dockerJuiHeadShaDir, param.deployUri, context.juiHeadShaDir)
                }
            }
        }

        // since SA and UT must be passed before we build and deploy app and jui
        // that means if app and jui have already been built,
        // SA and UT must have already passed, we can just skip them to save more resources
        context.skipSaAndUt = context.skipBuildApp && context.skipBuildJui

        context.skipBuildApp = context.skipBuildApp && !context.buildRelease

        // we can even skip install dependencies
        context.skipInstallDependencies = context.skipSaAndUt

        // don't skip e2e if configuration file exists
        context.skipEndToEnd = context.skipEndToEnd && !script.fileExists("tests/e2e/testcafe/configs/${param.gitlabSourceBranch}.json")

        // add the email of merge request related authors
        if(context.isMerge) {
            try {
                String getAuthorsCmd = "git rev-list '${param.gitlabTargetNamespace}/${param.gitlabTargetBranch}'..'${param.gitlabSourceNamespace}/${param.gitlabSourceBranch}' | xargs git show -s --format='%ae' | sort | uniq | grep -E -o '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}\\b'".toString()
                String[] authorsAddresses = script.sh(returnStdout: true, script:getAuthorsCmd).trim().split('\n')
                String[] glipAddresses = authorsAddresses.collect{ it.replaceAll('ringcentral.com', 'ringcentral.glip.com')}
                reportChannels.addAll(Arrays.asList(glipAddresses))
            } catch(e) {}
        }
    }
}

class InstallDependencyStage extends JupiterPipelineStage {

    InstallDependencyStage(JupiterPipelineContext context) {
        super(context)
    }

    void resolve() {
        util.condStage(name: 'Install Dependencies', enable: !context.skipInstallDependencies) {
            try {
                script.sh 'npm run fixed:version pre'
            } catch (e) { }
            script.sh "echo 'registry=${param.npmRegistry}' > .npmrc"
            script.sshagent(credentials: [param.scmCredentialId]) {
                // sh 'npm install @sentry/cli@1.40.0'
                // sh 'npm install @babel/parser@7.3.4'
                script.sh 'npm install --unsafe-perm'
            }
            try {
                script.sh 'npm run fixed:version check'
                script.sh 'npm run fixed:version cache'

                // create the file for judging if need to install dependency
                script.sh 'touch ' + util.getPackageJsonVersion()
            } catch (e) { }
        }
    }
}

class StaticAnalysisStage extends JupiterPipelineStage {

    StaticAnalysisStage(JupiterPipelineContext context) {
        super(context)
    }

    void resolve() {
        report.saReport = 'skip'
        util.condStage(name: 'Static Analysis', enable: !context.skipSaAndUt) {
            script.sh 'mkdir -p lint'
            try {
                script.sh 'npm run lint-all > lint/report.txt'
                report.saReport = "${context.SUCCESS_EMOJI} no tslint error".toString()
            } catch (e) {
                String saErrorMessage = sh(returnStdout: true, script: 'cat lint/report.txt').trim()
                report.saReport = "${context.FAILURE_EMOJI} ${saErrorMessage}".toString()
                throw e
            }
        }
    }
}

class UnitTestStage extends JupiterPipelineStage {

    UnitTestStage(JupiterPipelineContext context) {
        super(context)
    }

    void resolve() {
        report.coverage = 'skip'
        util.condStage(name: 'Unit Test', enable: !context.skipSaAndUt) {
            script.sh 'npm run test -- --coverage -w 4'
            script.publishHTML([
                allowMissing         : false,
                alwaysLinkToLastBuild: false,
                keepAll              : true,
                reportDir            : 'coverage/lcov-report',
                reportFiles          : 'index.html',
                reportName           : 'Coverage',
                reportTitles         : 'Coverage'
            ])
            report.coverage = "${param.buildUrl}Coverage".toString()
            // this is a work around
            if (!script.fileExists('coverage/coverage-summary.json')) {
                script.sh 'echo "{}" > coverage/coverage-summary.json'
            }
            if (!context.isMerge && param.integrationBranch == param.gitlabTargetBranch) {
                // attach coverage report as git note when new commits are pushed to integration branch
                // push git notes to remote
                script.sshagent(credentials: [param.scmCredentialId]) {
                    script.sh "git fetch -f ${param.gitlabSourceNamespace} refs/notes/*:refs/notes/*"
                    script.sh "git notes add -f -F coverage/coverage-summary.json ${context.appHeadSha}"
                    script.sh "git push -f ${param.gitlabSourceNamespace} refs/notes/* --no-verify"
                }
            }
            if (context.isMerge && param.integrationBranch == param.gitlabTargetBranch && script.fileExists('scripts/coverage-diff.js')) {
                // compare coverage report with integration branch's
                // step 1: fetch git notes
                script.sshagent(credentials: [param.scmCredentialId]) {
                    script.sh "git fetch -f ${param.gitlabTargetNamespace} ${param.gitlabTargetBranch}"
                    script.sh "git fetch -f ${param.gitlabTargetNamespace} refs/notes/*:refs/notes/*"
                }
                // step 2: get latest commit on integration branch with notes
                script.sh "git rev-list ${param.gitlabTargetNamespace}/${param.gitlabTargetBranch} > commit-sha.txt"
                script.sh "git notes | cut -d ' ' -f 2 > note-sha.txt"
                String latestCommitWithNote = script.sh(returnStdout: true, script: "grep -Fx -f note-sha.txt commit-sha.txt | head -1").trim()
                // step 3: compare with baseline
                if (latestCommitWithNote) {
                    // read baseline
                    script.sh "git notes show ${latestCommitWithNote} > baseline-coverage-summary.json"
                    // archive detail
                    try {
                        script.sh "npx ts-node scripts/report-diff.ts baseline-coverage-summary.json coverage/coverage-summary.json > coverage-diff.csv"
                        script.archiveArtifacts artifacts: 'coverage-diff.csv', fingerprint: true
                        report.coverageDiffDetail = "${param.buildUrl}artifact/coverage-diff.csv".toString()
                    } catch (e) {
                    }
                    // ensure increasing
                    int exitCode = script.sh(
                        returnStatus: true,
                        script: "node scripts/coverage-diff.js baseline-coverage-summary.json coverage/coverage-summary.json > coverage-diff",
                    )
                    report.coverageDiff = exitCode ? context.FAILURE_EMOJI : context.SUCCESS_EMOJI;
                    report.coverageDiff += script.sh(returnStdout: true, script: 'cat coverage-diff').trim()
                    if (exitCode > 0) {
                        script.sh 'echo "coverage drop!" && false'
                    }
                }
            }
        }
    }
}

class BuildJuiStage extends JupiterPipelineStage {

    BuildJuiStage(JupiterPipelineContext context) {
        super(context)
    }

    void resolve() {
        util.condStage(name: 'Build JUI', enable: !context.skipBuildJui) {
            script.sh 'npm run build:ui'
        }

        util.condStage(name: 'Deploy JUI') {
            String sourceDir = "packages/jui/storybook-static/"  // !!! don't forget trailing '/'
            script.sshagent(credentials: [param.deployCredentialId]) {
                // copy to dir name with head sha when dir is not exists
                context.skipBuildJui || util.rsyncFolderToRemote(sourceDir, param.deployUri, context.juiHeadShaDir)
                // and create copy to branch name based folder
                util.updateRemoteCopy(param.deployUri, context.juiHeadShaDir, param.juiLinkDir)
            }
        }
        report.juiUrl = param.juiUrl
    }
}

class BuildAppStage extends JupiterPipelineStage {

    BuildAppStage(JupiterPipelineContext context) {
        super(context)
    }

    void resolve() {
        util.condStage(name: 'Build Application', enable: !context.skipBuildApp) {
            // FIXME: move this part to build jenkins
            script.sh 'npx ts-node application/src/containers/VersionInfo/GitRepo.ts'
            script.sh 'mv commitInfo.ts application/src/containers/VersionInfo/'
            try {
                // fix FIJI-4534
                long timestamp = System.currentTimeMillis()
                script.sh "sed 's/{{buildCommit}}/${context.headSha.substring(0, 9)}/;s/{{buildTime}}/${timestamp}/' application/src/containers/VersionInfo/versionInfo.json > versionInfo.json"
                script.sh 'mv versionInfo.json application/src/containers/VersionInfo/versionInfo.json'
            } catch (e) {}
            if (context.buildRelease) {
                script.sh 'npm run build:release'
            } else {
                script.dir('application') {
                    script.sh 'npm run build'
                }
            }
        }

        util.condStage(name: 'Deploy Application') {
            String sourceDir = "application/build/"  // !!! don't forget trailing '/'
            script.sshagent(credentials: [param.deployCredentialId]) {
                // copy to dir name with head sha when dir is not exists
                context.skipBuildApp || util.rsyncFolderToRemote(sourceDir, param.deployUri, context.appHeadShaDir)
                // and create copy to branch name based folder, for release build, use replace instead of delete
                util.updateRemoteCopy(param.deployUri, context.appHeadShaDir, param.appLinkDir, !context.buildRelease)
                // and update version info
                long ts = System.currentTimeMillis()
                util.updateVersionInfo(param.deployUri, param.appLinkDir, context.headSha, ts)
                // for stage build, also create link to stage folder
                if (!context.isMerge && param.gitlabSourceBranch.startsWith('stage'))
                    util.updateRemoteCopy(param.deployUri, context.appHeadShaDir, param.appStageLinkDir)
            }
        }
        report.appUrl = param.appUrl
        util.safeMail(reportChannels, "Build Success: ${param.appUrl}".toString(), "Build Success: ${param.appUrl}".toString())
    }
}

class TelephonyAutomationStage extends JupiterPipelineStage {

    TelephonyAutomationStage(JupiterPipelineContext context) {
        super(context)
    }

    void resolve() {
        try {
            if (!context.isMerge && 'POC/FIJI-1302' == param.gitlabSourceBranch) {
                script.build(job: 'Jupiter-telephony-automation', parameters: [
                    [$class: 'StringParameterValue', name: 'BRANCH', value: 'POC/FIJI-1302'],
                    [$class: 'StringParameterValue', name: 'JUPITER_URL', value: param.appUrl],
                ])
            }
        } catch (e) {}
    }
}

class E2eAutomationStage extends JupiterPipelineStage {

    E2eAutomationStage(JupiterPipelineContext context) {
        super(context)
    }

    void resolve() {
        String hostname = script.sh(returnStdout: true, script: 'hostname -f').trim()
        String startTime = script.sh(returnStdout: true, script: "TZ=UTC-8 date +'%F %T'").trim()
        script.withEnv([
            "HOST_NAME=${hostname}",
            "SITE_URL=${param.appUrl}",
            "SITE_ENV=${param.e2eSiteEnv}",
            "SELENIUM_SERVER=${param.e2eSeleniumServer}",
            "SELENIUM_CHROME_CAPABILITIES=./chrome-opts.json",
            "ENABLE_REMOTE_DASHBOARD=${param.e2eEnableRemoteDashboard}",
            "ENABLE_MOCK_SERVER=${param.e2eEnableMockServer}",
            "BROWSERS=${param.e2eBrowsers}",
            "CONCURRENCY=${param.e2eConcurrency}",
            "EXCLUDE_TAGS=${param.e2eExcludeTags}",
            "BRANCH=${param.gitlabSourceBranch}",
            "ACTION=ON_MERGE",
            "SCREENSHOTS_PATH=./screenshots",
            "TMPFILE_PATH=./tmp",
            "DEBUG_MODE=false",
            "STOP_ON_FIRST_FAIL=true",
            "SKIP_JS_ERROR=true",
            "SKIP_CONSOLE_ERROR=true",
            "SKIP_CONSOLE_WARN=true",
            "SCREENSHOT_WEBP_QUALITY=80",
            "QUARANTINE_MODE=true",
            "QUARANTINE_FAILED_THRESHOLD=4",
            "QUARANTINE_PASSED_THRESHOLD=1",
            "RUN_NAME=[Jupiter][Pipeline][Merge][${startTime}][${param.gitlabSourceBranch}][${param.gitlabMergeRequestLastCommit}]",
        ]) {
            script.dir("tests/e2e/testcafe") {
                // print environment variable to help debug
                script.sh 'env'

                // following configuration file is use for tuning chrome, in order to use use-data-dir and disk-cache-dir
                // you need to ensure target dirs exist in selenium-node, and use ramdisk for better performance
                script.sh '''echo '{"chrome":{"goog:chromeOptions":{"args":["headless", "--disable-web-security"]}}}' > capabilities.json'''
                script.sh "mkdir -p screenshots tmp"
                script.sh "echo 'registry=${npmRegistry}' > .npmrc"
                script.sshagent(credentials: [param.scmCredentialId]) {
                    script.sh 'npm install --unsafe-perm'
                }

                if (param.e2eEnableRemoteDashboard) {
                    script.sh 'npx ts-node create-run-id.ts'
                    report.e2eUrl = sh(returnStdout: true, script: 'cat reportUrl || true').trim()
                } else {
                    report.e2eUrl = 'beat dashboard is disabled'
                }
                script.withCredentials([script.usernamePassword(
                    credentialsId: param.e2eRcCredentialId,
                    usernameVariable: 'RC_PLATFORM_APP_KEY',
                    passwordVariable: 'RC_PLATFORM_APP_SECRET')]) {
                    try {
                        script.sh "npm run e2e"
                    } finally {
                        if (!param.e2eEnableRemoteDashboard) {
                            script.sh "tar -czvf allure.tar.gz -C ./allure/allure-results . || true"
                            script.archiveArtifacts artifacts: 'allure.tar.gz', fingerprint: true
                        }
                        // TODO: else: close beat report properly
                    }
                }
            }
        }
    }
}

class ParallelStage extends JupiterPipelineStage {
    List<JupiterPipelineStage> stageList = []

    ParallelStage(JupiterPipelineStage... stages) {
        super(context)
        for (stage in stages) {
            stageList.add(stage)
        }
    }

    void resolve() {
        script.parallel stageList.forEach({ it.run() })
    }
}

class JupiterPipeline {
    def script
    JupiterPipelineContext context
    JupiterPipelineParam param
    Map report
    BaseJob util

    JupiterPipeline(script) {
        this.script = script
        this.context = new JupiterPipelineContext(script: script)
        this.param = this.context.param
        this.report = this.context.report
        this.util = this.context.util
    }

    void run() {
        // start to build
        context.skipUpdateGitlabStatus || script.updateGitlabCommitStatus(name: 'jenkins', state: 'pending')
        util.cancelOldBuildOfSameCause()

        script.node(param.buildNode) {
            context.skipUpdateGitlabStatus || script.updateGitlabCommitStatus(name: 'jenkins', state: 'running')

            // install nodejs tool and update environment variables
            script.env.NODEJS_HOME = script.tool param.nodejsTool
            script.env.PATH="${script.env.NODEJS_HOME}/bin:${script.env.PATH}"
            script.env.TZ='UTC-8'
            script.env.NODE_ENV='development'
            script.env.SENTRYCLI_CDNURL='https://cdn.npm.taobao.org/dist/sentry-cli'

            try {

                def buildAppStage = new BuildAppStage(context)
                def buildJuiStage = new BuildJuiStage(context)
                def checkoutStage = new CheckoutStage(context)
                def collectFactsStage = new CollectFactsStage(context)
                def e2eAutomationStage = new E2eAutomationStage(context)
                def installDependencyStage = new InstallDependencyStage(context)
                def postCheckoutStage = new PostCheckoutStage(context)
                def staticAnalysisStage = new StaticAnalysisStage(context)
                def telephonyAutomationStage = new TelephonyAutomationStage(context)
                def unitTestStage = new UnitTestStage(context)

                //organize stages logic
                def temp = collectFactsStage.next(checkoutStage).next(postCheckoutStage)
                if(needInstallDependency()) {
                    temp = temp.next(installDependencyStage)
                }

                temp.next(new ParallelStage(staticAnalysisStage, unitTestStage))
                    .next(new ParallelStage(buildJuiStage, buildAppStage))
                    .next(telephonyAutomationStage)
                    .next(e2eAutomationStage)

                // start run stages
                collectFactsStage.run()

                postSuccess()
            } catch (e) {
                postFailure(e)
            }
        }
    }

    void postSuccess() {
        context.skipUpdateGitlabStatus || script.updateGitlabCommitStatus(name: 'jenkins', state: 'success')
        report.description = script.currentBuild.getDescription()
        report.jobUrl = param.buildUrl
        report.buildResult = "${context.SUCCESS_EMOJI} Success".toString()
        script.currentBuild.setDescription(util.formatJenkinsReport(report))
        util.safeMail(context.reportChannels, "Jenkins Pipeline Success: ${script.currentBuild.fullDisplayName}".toString(), BaseJob.formatGlipReport(report))
    }

    void postFailure(e) {
        context.skipUpdateGitlabStatus || script.updateGitlabCommitStatus(name: 'jenkins', state: 'failed')
        report.description = script.currentBuild.getDescription()
        report.jobUrl = param.buildUrl
        report.buildResult = "${context.FAILURE_EMOJI} Failure".toString()
        if (e in InterruptedException)
            report.buildResult = "${context.ABORTED_EMOJI} Aborted".toString()
        script.currentBuild.setDescription(util.formatJenkinsReport(report))
        util.safeMail(context.reportChannels, "Jenkins Pipeline Stop: ${script.currentBuild.fullDisplayName}".toString(), BaseJob.formatGlipReport(report))
        throw e
    }

    boolean needInstallDependency() {
        def version = util.getPackageJsonVersion()
        return !script.fileExists(version)
    }

}

new JupiterPipeline(script: this).run()
