import jenkins.model.*
import com.dabsquared.gitlabjenkins.cause.GitLabWebHookCause
import java.net.URI

class Context {
    final static String SUCCESS_EMOJI  = ':white_check_mark:'
    final static String FAILURE_EMOJI  = ':x:'
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
    String e2eNode
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

    URI lockUri
    String lockCredentialId

    // automation
    String rcCredentialId
    String e2eSiteEnv
    String e2eSeleniumServer
    String e2eBrowsers
    String e2eConcurrency
    String e2eExcludeTags
    String e2eCapabilities
    Boolean e2eEnableRemoteDashboard
    Boolean e2eEnableMockServer
    String feedbackUrl

    // runtime
    long timestamp = System.currentTimeMillis()
    String head
    String appHeadHash
    String juiHeadHash
    String rcuiHeadHash

    Boolean buildStatus = false
    String buildDescription
    String saSummary
    String coverageSummary
    String coverageDiff
    String coverageDiffDetail
    String e2eReport

    Boolean buildAppSuccess = false
    Boolean buildJuiSuccess = false
    Boolean buildRcuiSuccess = false

    Set<String> addresses = []
    Set<String> rcuiA11yReportAddresses = []
    List<String> failedStages = []

    Boolean getIsMerge() {
        gitlabSourceBranch != gitlabTargetBranch
    }

    Boolean getIsSkipUnitTestAndStaticAnalysis() {
        // for a merge event, if target branch is not an stable branch, skip unit test
        // for a push event, skip if not an integration branch
        isMerge? !isStableBranch(gitlabTargetBranch) : !isIntegrationBranch(gitlabSourceBranch)
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

    Boolean getIsStageBuild() {
        !isMerge && gitlabSourceBranch.startsWith('stage')
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

    String getJuiHashUrl() {
        "https://${juiLockKey}.${DOMAIN}".toString()
    }

    String getRcuiUrl() {
        "https://${subDomain}-rcui.${DOMAIN}".toString()
    }

    String getRcuiHashUrl() {
        "https://${rcuiLockKey}.${DOMAIN}".toString()
    }

    String getAppHeadHashDir() {
        "${deployBaseDir}/${appLockKey}".toString()
    }

    String getJuiHeadHashDir() {
        "${deployBaseDir}/${juiLockKey}".toString()
    }

    String getRcuiHeadHashDir() {
        "${deployBaseDir}/${rcuiLockKey}".toString()
    }

    String getStaticAnalysisLockKey() {
        "staticanalysis-${appHeadHash}".toString()
    }

    String getUnitTestLockKey() {
        "unittest-${appHeadHash}".toString()
    }

    String getAppLockKey() {
        "app${isBuildRelease? '-release' : ''}-${appHeadHash}".toString()
    }

    String getJuiLockKey() {
        "jui-${juiHeadHash}".toString()
    }

    String getRcuiLockKey() {
        "rcui-${rcuiHeadHash}".toString()
    }

    String getEndToEndTestLog() {
        "e2e-${appHeadHash}.log".toString()
    }

    String getErrorMessage() {
        failedStages.join(', ')
    }

    String getBuildResult() {
        buildStatus? "${SUCCESS_EMOJI} Success".toString() :"${FAILURE_EMOJI} Failed".toString()
    }

    String getGlipReport() {
        List<String> lines = []
        if (buildResult)
            lines.push("**Build Result**: ${buildResult}")
        if (errorMessage)
            lines.push("**Failed Stages**: ${errorMessage}")
        if (buildDescription)
            lines.push("**Description**: ${tagToGlipLink(buildDescription)}")
        if (buildUrl)
            lines.push("**Job**: ${buildUrl}")
        if (saSummary)
            lines.push("**Static Analysis**: ${saSummary}")
        if (coverageSummary)
            lines.push("**Coverage Report**: ${coverageSummary}")
        if (coverageDiff)
            lines.push("**Coverage Changes**: ${coverageDiff}")
        if (coverageDiffDetail)
            lines.push("**Coverage Changes Detail**: ${coverageDiffDetail}")
        if (appUrl && buildAppSuccess)
            lines.push("**Application**: ${appUrl}")
        if (juiUrl && buildJuiSuccess)
            lines.push("**Storybook**: ${juiUrl}")
        if (rcuiUrl && buildRcuiSuccess)
            lines.push("**RCUI Storybook**: ${rcuiUrl}")
        if (e2eReport)
            lines.push("**E2E Report**: ${e2eReport}")
        if (feedbackUrl)
            lines.push("**Note**: Feel free to submit [form](${feedbackUrl}) if you have problems.".toString())
        lines.join(' \n')
    }

    String getJenkinsReport() {
        List<String> lines = []
        if (buildDescription)
            lines.push("Description: ${buildDescription}")
        if (saSummary)
            lines.push("Static Analysis: ${saSummary}")
        if (coverageDiff)
            lines.push("Coverage Changes: ${coverageDiff}")
        if (appUrl && buildAppSuccess)
            lines.push("Application: ${urlToTag(appUrl)}")
        if (juiUrl && buildJuiSuccess)
            lines.push("Storybook: ${urlToTag(juiUrl)}")
        if (rcuiUrl && buildRcuiSuccess)
            lines.push("RCUI Storybook: ${urlToTag(rcuiUrl)}")
        if (e2eReport)
            lines.push("E2E Report: ${urlToTag(e2eReport)}")
        lines.join('<br>')
    }
}

class BaseJob {
    def jenkins

    // abstract method
    void addFailedStage(String name) {}

    // jenkins utils
    @NonCPS
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
                jenkins.echo "build ${build.getFullDisplayName()} is terminating"
                build.doStop()
                for (int i = 0; i < 10; i++) {
                    if (!build.isBuilding())
                        break
                    jenkins.sleep 10
                }
            }
            return
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
                jenkins.error "Failed on stage ${name}\n${e.dump()}"
            }
        }
    }

    void mail(addresses, String subject, String body) {
        addresses.each {
            try {
                jenkins.mail to: it, subject: subject, body: body
            } catch (e) { println e.dump() }
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
        jenkins.sh "scp -o StrictHostKeyChecking=no -P ${targetUri.getPort()} ${source} ${remoteTarget}"
    }

    void deployToRemote(String sourceDir, URI targetUri, String targetDir) {
        deployToRemote(sourceDir, targetUri, targetDir, "tmp-${Math.random()}.tar.gz".toString())
    }

    void deployToRemote(String sourceDir, URI targetUri, String targetDir, String tarball) {
        jenkins.sh "tar -czvf ${tarball} -C ${sourceDir} ."  // pack
        ssh(targetUri, "rm -rf ${targetDir} || true && mkdir -p ${targetDir}".toString())  // clean target
        scp(tarball, targetUri, targetDir)
        ssh(targetUri, "tar -xzvf ${targetDir}/${tarball} -C ${targetDir} && rm ${targetDir}/${tarball} && chmod -R 755 ${targetDir}".toString()) // unpack
    }

    void copyRemoteDir(URI remoteUri, String sourceDir, String targetDir) {
        ssh(remoteUri, "mkdir -p ${targetDir} && cp -rf ${sourceDir}/* ${targetDir}/".toString())
    }

    // ssh based distributed file lock
    void lockKey(String credentialId, URI lockUri, String key) {
        jenkins.sshagent (credentials: [credentialId]) {
            ssh(lockUri, "mkdir -p ${lockUri.getPath()} && touch ${lockUri.getPath()}/${key}".toString())
        }
    }

    Boolean hasBeenLocked(String credentialId, URI lockUri, String key) {
        jenkins.sshagent (credentials: [credentialId]) {
            return 'true' == ssh(lockUri, "[ -f ${lockUri.getPath()}/${key} ] && echo 'true' || echo 'false'".toString())
        }
    }

    void writeKeyFile(String credentialId, URI lockUri, String key, String filepath) {
        if (!jenkins.fileExists(filepath) ) return

        jenkins.sshagent (credentials: [credentialId]) {
            ssh(lockUri, "mkdir -p ${lockUri.getPath()}".toString())
            scp(filepath, lockUri, "${lockUri.getPath()}/${key}".toString())
        }
    }

    void readKeyFile(String credentialId, URI lockUri, String key, String filepath) {
        jenkins.sshagent (credentials: [credentialId]) {
            String text = ssh(lockUri, "cat ${lockUri.getPath()}/${key} || true".toString())?: ''
            jenkins.writeFile file: filepath, text: text, encoding: 'utf-8'
        }
    }
}

class JupiterJob extends BaseJob {
    final static String DEPENDENCY_LOCK = 'dependency.lock'
    final static String E2E_DIRECTORY = 'tests/e2e/testcafe'

    Context context

    void addFailedStage(String name) {
        context.failedStages.add(name)
    }

    String getJobDescription() {
        context.tagToGlipLink(jenkins.currentBuild.getDescription())
    }

    void run() {
        try {
            doRun()
            context.buildStatus = true
        } finally {
            context.buildDescription = jenkins.currentBuild.getDescription()
            jenkins.currentBuild.setDescription(context.jenkinsReport)

            if (context.buildStatus) {
                context.isSkipUpdateGitlabStatus || jenkins.updateGitlabCommitStatus(name: 'jenkins', state: 'success')
            } else {
                context.isSkipUpdateGitlabStatus || jenkins.updateGitlabCommitStatus(name: 'jenkins', state: 'failed')
                jenkins.echo context.dump()
                // jenkins.echo jenkins.currentBuild.dump()
                // jenkins.echo jenkins.currentBuild.rawBuild.dump()
            }
            mail(context.addresses, "Jenkins Build Result: ${context.buildResult}".toString(), context.glipReport)
        }
    }

    void doRun() {
        cancelOldBuildOfSameCause()
        context.isSkipUpdateGitlabStatus || jenkins.updateGitlabCommitStatus(name: 'jenkins', state: 'pending')
        // using a high performance node to build
        jenkins.node(context.isSkipUnitTestAndStaticAnalysis? context.e2eNode : context.buildNode) {
            context.isSkipUpdateGitlabStatus || jenkins.updateGitlabCommitStatus(name: 'jenkins', state: 'running')

            String nodejsHome = jenkins.tool context.nodejsTool
            jenkins.withEnv([
                "PATH+NODEJS=${nodejsHome}/bin",
                'TZ=UTC-8',
                'CI=false',
                'SENTRYCLI_CDNURL=https://cdn.npm.taobao.org/dist/sentry-cli',
                'ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/',
                'NODE_OPTIONS=--max_old_space_size=12000',
            ]) {
                stage(name: 'Collect Facts'){ collectFacts() }
                stage(name: 'Checkout'){ checkout() }
                stage(name: 'Install Dependencies') { installDependencies() }
                jenkins.parallel (
                    'Unit Test' : {
                        stage(name: 'Unit Test') { unitTest() }
                    },
                    'Static Analysis': {
                        stage(name: 'Static Analysis') { staticAnalysis() }
                    },
                )
                jenkins.parallel(
                    'Build Application' : {
                        stage(name: 'Build Application') { buildApp() }
                    },
                    'Build JUI': {
                        stage(name: 'Build JUI') { buildJui() }
                    },
                    'Build RCUI': {
                        stage(name: 'Build RCUI') { buildRcui() }
                    },
                )
            }
            stashEndToEnd()
        }

        // using an average node to run e2e
        jenkins.node(context.e2eNode) {
            unstashEndToEnd()
            String nodejsHome = jenkins.tool context.nodejsTool
            jenkins.withEnv([
                "PATH+NODEJS=${nodejsHome}/bin",
            ]) {
                stage(name: 'E2E Automation') { e2eAutomation() }
            }
        }
    }
    void stashEndToEnd() {
        String tarball = "testcafe-${context.head}.tar.gz".toString()
        jenkins.dir(E2E_DIRECTORY) {
            jenkins.sh 'git clean -xdf'
        }
        jenkins.sh "tar -czvf ${tarball} ${E2E_DIRECTORY}"
        jenkins.stash name: tarball, includes: tarball
    }

    void unstashEndToEnd() {
        String tarball = "testcafe-${context.head}.tar.gz".toString()
        jenkins.sh "find ${E2E_DIRECTORY} -mindepth 1 -maxdepth 1 -not -name node_modules | xargs rm -rf"
        jenkins.unstash name: tarball
        jenkins.sh "tar -xzvf ${tarball}"
    }

    void collectFacts() {
        // test commands
        jenkins.sh 'env'
        jenkins.sh 'uptime'
        jenkins.sh 'df -h'
        jenkins.sh 'node -v'
        jenkins.sh 'tar --version'
        jenkins.sh 'git --version'
        jenkins.sh 'rsync --version'
        jenkins.sh 'grep --version'
        jenkins.sh 'which tr'
        jenkins.sh 'which xargs'
        jenkins.sh 'yum install gtk3-devel libXScrnSaver xorg-x11-server-Xvfb -y || true'

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
        // jenkins.sh "git clean -xdf"  // work around errors

        // update runtime context

        // get head
        context.head = jenkins.sh(returnStdout: true, script: 'git rev-parse HEAD').trim()

        // change in tests and autoDevOps directory should not trigger application build
        // for git 1.9, there is an easy way to exclude files
        // but most slaves are centos, whose git's version is still 1.8, we use a cmd pipeline here for compatibility
        // the reason to use stableHash is if HEAD is generate via fast-forward,
        // the commit will be changed when re-running the job due to timestamp changed
        context.appHeadHash = getStableHash(
            jenkins.sh(returnStdout: true, script: '''ls -1 | grep -Ev '^(tests|autoDevOps)$' | tr '\\n' ' ' | xargs git rev-list -1 HEAD -- ''').trim()
        )
        context.juiHeadHash = getStableHash(
            jenkins.sh(returnStdout: true, script: '''git rev-list -1 HEAD -- packages/jui''').trim()
        )
        context.rcuiHeadHash = getStableHash(
            jenkins.sh(returnStdout: true, script: '''git rev-list -1 HEAD -- packages/rcui''').trim()
        )
        assert context.head && context.appHeadHash && context.juiHeadHash && context.rcuiHeadHash

        // update email address
        context.addresses.add(context.messageChannel)
        if (context.gitlabUserEmail)
            context.addresses.add(context.gitlabUserEmail)

        String getAuthorsCmd =
            "git rev-list '${context.gitlabTargetNamespace}/${context.gitlabTargetBranch}'..'${context.gitlabSourceNamespace}/${context.gitlabSourceBranch}' | xargs git show -s --format='%ae' | sort | uniq | grep -E -o '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}\\b' || true".toString()
        List<String> authors = jenkins.sh(returnStdout: true, script:getAuthorsCmd).trim().split('\n')
        List<String> glipAddresses = authors.collect{ it.replaceAll('ringcentral.com', 'ringcentral.glip.com')}
        context.addresses.addAll(glipAddresses)
        context.rcuiA11yReportAddresses.addAll(glipAddresses)
    }

    void installDependencies() {
        if(isSkipInstallDependency) return

        String dependencyLock = jenkins.sh(returnStdout: true, script: '''git ls-files | grep package.json | grep -v tests | tr '\\n' ' ' | xargs git rev-list -1 HEAD -- | xargs git cat-file commit | grep -e ^tree | cut -d ' ' -f 2 ''').trim()
        if (jenkins.fileExists(DEPENDENCY_LOCK) && jenkins.readFile(file: DEPENDENCY_LOCK, encoding: 'utf-8').trim() == dependencyLock) {
            jenkins.echo "${DEPENDENCY_LOCK} doesn't change, no need to update: ${dependencyLock}"
            return
        }
        jenkins.sh "npm config set registry ${context.npmRegistry}"
        jenkins.sh 'npm run fixed:version pre || true'  // suppress error
        jenkins.sshagent (credentials: [context.scmCredentialId]) {
            jenkins.sh 'npm install --unsafe-perm'
        }
        jenkins.writeFile(file: DEPENDENCY_LOCK, text: dependencyLock, encoding: 'utf-8')
        jenkins.sh 'npm run fixed:version check || true'  // suppress error
        jenkins.sh 'npm run fixed:version cache || true'  // suppress error
    }

    void staticAnalysis() {
        if (isSkipStaticAnalysis) return

        jenkins.sh 'mkdir -p lint'
        try {
            jenkins.sh 'npm run lint-all > lint/report.txt'
            context.saSummary = "${context.SUCCESS_EMOJI} no tslint error".toString()
            lockKey(context.lockCredentialId, context.lockUri, context.staticAnalysisLockKey)
        } catch (e) {
            String stdout = jenkins.sh(returnStdout: true, script: 'cat lint/report.txt').trim()
            context.saSummary = "${context.FAILURE_EMOJI} ${stdout}".toString()
            jenkins.error "Static Analysis Failed!\n${e.dump()}"
        }
    }

    void unitTest() {
        if (isSkipUnitTest) return

        if (jenkins.sh(returnStatus: true, script: 'which xvfb-run') > 0) {
            jenkins.sh 'npm run test -- --coverage -w 16'
        } else {
            jenkins.sh 'xvfb-run -d -s "-screen 0 1920x1200x24" npm run test -- --coverage -w 16'
        }

        String reportName = 'Coverage'
        jenkins.publishHTML([
            reportDir: 'coverage/lcov-report', reportFiles: 'index.html', reportName: reportName, reportTitles: reportName,
            allowMissing: false, alwaysLinkToLastBuild: false, keepAll: true,
        ])
        context.coverageSummary = "${context.buildUrl}${reportName}".toString()

        if (!context.isMerge) {
            jenkins.sshagent (credentials: [context.scmCredentialId]) {
                // attach coverage report as git note when new commits are pushed to integration branch
                jenkins.sh "git notes add -f -F coverage/coverage-summary.json ${context.head}"
                // push git notes to remote
                jenkins.sh "git push -f ${context.gitlabSourceNamespace} refs/notes/* --no-verify"
            }
        } else {
            // compare coverage report with baseline branch's
            // step 1: fetch git notes
            jenkins.sshagent (credentials: [context.scmCredentialId]) {
                jenkins.sh "git fetch -f ${context.gitlabTargetNamespace} ${context.gitlabTargetBranch}"
                jenkins.sh "git fetch -f ${context.gitlabTargetNamespace} refs/notes/*:refs/notes/*"
            }
            // step 2: get latest commit on baseline branch with notes
            jenkins.sh "git rev-list HEAD > commit-sha.txt"
            jenkins.sh "git notes | cut -d ' ' -f 2 > note-sha.txt"
            String latestCommitWithNote = jenkins.sh(returnStdout: true, script: "grep -Fx -f note-sha.txt commit-sha.txt | head -1").trim()
            // step 3: compare with baseline
            if (latestCommitWithNote) {
                // read baseline
                jenkins.sh "git notes show ${latestCommitWithNote} > baseline-coverage-summary.json"
                // create diff report
                jenkins.sh "npx ts-node scripts/report-diff.ts baseline-coverage-summary.json coverage/coverage-summary.json > coverage-diff.csv"
                jenkins.archiveArtifacts artifacts: 'coverage-diff.csv', fingerprint: true
                context.coverageDiffDetail = "${context.buildUrl}artifact/coverage-diff.csv".toString()
                // ensure increasing
                int exitCode = jenkins.sh(
                    returnStatus: true,
                    script: "node scripts/coverage-diff.js baseline-coverage-summary.json coverage/coverage-summary.json > coverage-diff",
                )
                context.coverageDiff = "${exitCode > 0 ? context.FAILURE_EMOJI : context.SUCCESS_EMOJI} ${jenkins.sh(returnStdout: true, script: 'cat coverage-diff').trim()}".toString()
                // throw error on coverage drop
                if (exitCode > 0) jenkins.error 'coverage drop!'
            }
        }
        lockKey(context.lockCredentialId, context.lockUri, context.unitTestLockKey)
    }

    void buildApp() {
        if (!isSkipBuildApp) {
            // FIXME: move this part to build script
            jenkins.sh 'npx ts-node application/src/containers/VersionInfo/GitRepo.ts'
            jenkins.sh 'mv commitInfo.ts application/src/containers/VersionInfo/'
            jenkins.sh "sed 's/{{buildCommit}}/${context.head.substring(0, 9)}/;s/{{buildTime}}/${context.timestamp}/' application/src/containers/VersionInfo/versionInfo.json > versionInfo.json || true"
            jenkins.sh 'mv versionInfo.json application/src/containers/VersionInfo/versionInfo.json || true'
            if (context.isBuildRelease) {
                jenkins.sh 'npm run build:release'
            } else {
                jenkins.dir('application') {
                    jenkins.sh 'npm run build'
                }
            }
            String sourceDir = 'application/build'
            // The reason we add this check is sometimes the build package is incomplete
            // The root cause maybe the improperly error handling in build script (maybe always exit with 0)
            if (!jenkins.fileExists("${sourceDir}/index.html"))
                jenkins.error "Build application is incomplete!"

            jenkins.sshagent(credentials: [context.deployCredentialId]) {
                deployToRemote(sourceDir, context.deployUri, context.appHeadHashDir)
            }
            lockKey(context.lockCredentialId, context.lockUri, context.appLockKey)
        }
        // deploy a user friendly domain directory
        jenkins.sshagent(credentials: [context.deployCredentialId]) {
            // update precache revision
            updateRemotePrecacheRevision()
            // and create copy to branch name based folder, for release build, use replace instead of delete
            copyRemoteDir(context.deployUri, context.appHeadHashDir, context.appLinkDir)
            // and update version info
            updateRemoteVersionInfo()
            // for stage build, also create link to stage folder
            if (context.isStageBuild) {
                copyRemoteDir(context.deployUri, context.appLinkDir, context.appStageLinkDir)
            }
        }
        context.buildAppSuccess = true
    }

    void buildJui() {
        if (!isSkipBuildJui) {
            jenkins.sh 'npm run build:ui'
            String sourceDir = "packages/jui/storybook-static"
            jenkins.sshagent(credentials: [context.deployCredentialId]) {
                deployToRemote(sourceDir, context.deployUri, context.juiHeadHashDir)
            }
            juiAutomation()
            lockKey(context.lockCredentialId, context.lockUri, context.juiLockKey)
        }
        jenkins.sshagent(credentials: [context.deployCredentialId]) {
            copyRemoteDir(context.deployUri, context.juiHeadHashDir, context.juiLinkDir)
        }
        context.buildJuiSuccess = true
    }

    void juiAutomation() {
        jenkins.dir('packages/jui') {
            jenkins.withEnv([
                "JUI_URL=${context.juiHashUrl}",
            ]) {
                try {
                    jenkins.sh 'npm run test || true'
                } finally {
                    String tarball = "jui-snapshots-diff-${context.head}.tar.gz".toString()
                    String snapshotDir = 'src/__tests__/snapshot/__image_snapshots__/__diff_output__'
                    jenkins.sh "tar -czvf ${tarball} -C ${snapshotDir} || true"
                    if (jenkins.fileExists(tarball))
                        jenkins.archiveArtifacts artifacts: tarball, fingerprint: true
                }
            }
        }
    }

    void buildRcui() {
        if (!isSkipBuildRcui) {
            jenkins.dir('packages/rcui') {
                jenkins.sh 'npm run build:storybook'
            }
            String sourceDir = "packages/rcui/public"
            jenkins.sshagent(credentials: [context.deployCredentialId]) {
                deployToRemote(sourceDir, context.deployUri, context.rcuiHeadHashDir)
            }
            try {
                rcuiAccessibilityAutomation()
            }catch (e) { }
            lockKey(context.lockCredentialId, context.lockUri, context.rcuiLockKey)
        }
        jenkins.sshagent(credentials: [context.deployCredentialId]) {
            copyRemoteDir(context.deployUri, context.rcuiHeadHashDir, context.rcuiLinkDir)
        }
        context.buildRcuiSuccess = true
    }

    void rcuiAccessibilityAutomation() {
        jenkins.dir('packages/rcui/tests/testcafe') {
            String rcuiResultDir = 'rcui-result'
            jenkins.withEnv([
                "TEST_URL=${context.rcuiHashUrl}",
                "FILE_PATH=${rcuiResultDir}",
                "SELENIUM_SERVER=${context.e2eSeleniumServer}",
            ]) {
                jenkins.sh 'env'
                jenkins.sh "npm config set registry ${context.npmRegistry}"
                jenkins.sh 'npm install --only=dev'
                jenkins.sh 'npm run test'
                String reportName = 'RCUI-Accessibility'

                jenkins.publishHTML([
                    reportDir: "${rcuiResultDir}/html", reportFiles: 'accessibility-check.html', reportName: reportName, reportTitles: reportName,
                    allowMissing: false, alwaysLinkToLastBuild: false, keepAll: true,
                ])
                String rcuiReportUrl = "${context.buildUrl}${reportName}".toString()
                mail(context.rcuiA11yReportAddresses, "rcui accessibility automation result", createRcuiReport(rcuiResultDir, rcuiReportUrl))
            }
        }
    }

    String createRcuiReport(String rcuiResultDir, String rcuiReportUrl) {
        jenkins.dir(rcuiResultDir) {
            String passedComponents = jenkins.readFile(file: 'allPass.txt', encoding: 'utf-8').trim()
            String failedComponents = jenkins.readFile(file: 'noAllPass.txt', encoding: 'utf-8').trim()
            if(passedComponents) {
                passedComponents = passedComponents.split('\n').collect{ "${context.SUCCESS_EMOJI} ${it}".toString()}.join('\n')
            }
            if(failedComponents) {
                failedComponents = failedComponents.split('\n').collect{ "${context.FAILURE_EMOJI} ${it}".toString()}.join('\n')
            }
            return [
                "[**RCUI Accessibility Report**](${rcuiReportUrl})".toString(),
                "**Build Summary:** ${jobDescription}".toString(),
                "**Build URL:** [here](${context.buildUrl})".toString(),
                "**RCUI Storybook:** [here](${context.rcuiHashUrl})".toString(),
                '**Components:**',
                passedComponents,
                failedComponents,
            ].join('\n')
        }
    }

    void e2eAutomation() {
        if (isSkipEndToEnd) return

        String hostname  = jenkins.sh(returnStdout: true, script: 'hostname -f').trim()
        String startTime = jenkins.sh(returnStdout: true, script: "TZ=UTC-8 date +'%F %T'").trim()

        jenkins.withEnv([
            "HOST_NAME=${hostname}",
            "SITE_URL=${context.appUrl}",
            "SITE_ENV=${context.e2eSiteEnv}",
            "SELENIUM_SERVER=${context.e2eSeleniumServer}",
            "ENABLE_REMOTE_DASHBOARD=${context.e2eEnableRemoteDashboard}",
            "ENABLE_MOCK_SERVER=${context.e2eEnableMockServer}",
            "BROWSERS=${context.e2eBrowsers}",
            "CONCURRENCY=${context.e2eConcurrency}",
            "EXCLUDE_TAGS=${context.e2eExcludeTags}",
            "BRANCH=${context.gitlabSourceBranch}",
            "TESTS_LOG=${context.endToEndTestLog}",
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
            "QUARANTINE_FAILED_THRESHOLD=3",
            "QUARANTINE_PASSED_THRESHOLD=1",
            "DEBUG=axios",
            "ENABLE_SSL=true",
            "ENABLE_NOTIFICATION=true",
            "RUN_NAME=[Jupiter][Pipeline][Merge][${startTime}][${context.gitlabSourceBranch}][${context.head}]",
        ]) {
            jenkins.dir(E2E_DIRECTORY) {
                jenkins.sh 'env'  // for debug
                jenkins.writeFile file: 'capabilities.json', text: context.e2eCapabilities, encoding: 'utf-8'
                jenkins.sh "mkdir -p screenshots tmp"
                jenkins.sh "npm config set registry ${context.npmRegistry}"
                jenkins.sshagent(credentials: [context.scmCredentialId]) {
                    jenkins.sh 'npm install --unsafe-perm'
                }

                if (context.e2eEnableRemoteDashboard) {
                    jenkins.sh 'npx ts-node create-run-id.ts'
                    context.e2eReport = jenkins.sh(returnStdout: true, script: 'cat reportUrl || true').trim()
                }

                jenkins.withCredentials([jenkins.usernamePassword(
                    credentialsId: context.rcCredentialId,
                    usernameVariable: 'RC_PLATFORM_APP_KEY',
                    passwordVariable: 'RC_PLATFORM_APP_SECRET')]) {
                    try {
                        readKeyFile(context.lockCredentialId, context.lockUri, context.endToEndTestLog, context.endToEndTestLog)
                        jenkins.sh "npm run e2e"
                    } finally {
                        writeKeyFile(context.lockCredentialId, context.lockUri, context.endToEndTestLog, context.endToEndTestLog)
                        if (!context.e2eEnableRemoteDashboard) {
                            jenkins.sh "tar -czvf allure.tar.gz -C ./allure/allure-results . || true"
                            jenkins.archiveArtifacts artifacts: 'allure.tar.gz', fingerprint: true
                        }
                    }
                }
            }
        }
    }

    void updateRemotePrecacheRevision() {
        long timestamp = context.timestamp
        URI remoteUri = context.deployUri
        String appHeadHashDir = context.appHeadHashDir
        String cmd = """rm -f ${appHeadHashDir}/precache-manifest.js.bak || true && cp -f ${appHeadHashDir}/precache-manifest.*.js ${appHeadHashDir}/precache-manifest.js.bak &&  awk -v rev='    \\"revision\\": \\"${timestamp}\\",' '/versionInfo/{sub(/.+/,rev,last)} NR>1{print last} {last=\\\$0} END {print last}' ${appHeadHashDir}/precache-manifest.js.bak > ${appHeadHashDir}/precache-manifest.*.js""".toString()
        ssh(remoteUri, cmd)
    }

    void updateRemoteVersionInfo() {
        long timestamp = context.timestamp
        URI remoteUri = context.deployUri
        String appLinkDir = context.appLinkDir
        String sha = context.head
        String cmd = "sed -i 's/{{deployedCommit}}/${sha.substring(0,9)}/;s/{{deployedTime}}/${timestamp}/' ${appLinkDir}/static/js/versionInfo.*.chunk.js || true".toString()
        ssh(remoteUri, cmd)
    }

    Boolean getIsSkipInstallDependency() {
        isSkipUnitTest && isSkipStaticAnalysis && isSkipBuildApp && isSkipBuildJui && isSkipBuildRcui
    }

    Boolean getIsSkipUnitTest() {
        context.isSkipUnitTestAndStaticAnalysis || (context.isMerge && hasBeenLocked(context.deployCredentialId, context.lockUri, context.unitTestLockKey))
    }

    Boolean getIsSkipStaticAnalysis() {
        context.isSkipUnitTestAndStaticAnalysis || hasBeenLocked(context.deployCredentialId, context.lockUri, context.staticAnalysisLockKey)
    }

    Boolean getIsSkipBuildApp() {
        hasBeenLocked(context.deployCredentialId, context.lockUri, context.appLockKey)
    }

    Boolean getIsSkipBuildJui() {
        hasBeenLocked(context.deployCredentialId, context.lockUri, context.juiLockKey)
    }

    Boolean getIsSkipBuildRcui() {
        hasBeenLocked(context.deployCredentialId, context.lockUri, context.rcuiLockKey)
    }

    Boolean getIsSkipEndToEnd() {
        context.isSkipEndToEnd
    }
}

// Get started!
Context context = new Context(
    buildNode                   : params.BUILD_NODE?: env.BUILD_NODE,
    e2eNode                     : params.E2E_NODE?: env.E2E_NODE,
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
    deployUri                   : new URI(params.DEPLOY_URI),
    deployBaseDir               : params.DEPLOY_BASE_DIR,
    lockUri                     : new URI(params.LOCK_URI),
    lockCredentialId            : params.LOCK_CREDENTIAL,

    rcCredentialId              : params.E2E_RC_CREDENTIAL,
    e2eSiteEnv                  : params.E2E_SITE_ENV,
    e2eSeleniumServer           : params.E2E_SELENIUM_SERVER,
    e2eBrowsers                 : params.E2E_BROWSERS,
    e2eConcurrency              : params.E2E_CONCURRENCY,
    e2eExcludeTags              : params.E2E_EXCLUDE_TAGS?: '',
    e2eEnableRemoteDashboard    : params.E2E_ENABLE_REMOTE_DASHBOARD,
    e2eEnableMockServer         : params.E2E_ENABLE_MOCK_SERVER,
    e2eCapabilities             : params.E2E_CAPABILITIES,
    feedbackUrl                 : params.FEEDBACK_URL,
)

context.rcuiA11yReportAddresses.addAll(params.RCUI_A11Y_REPORT_ADDRESSES.split('\n'))
context.gitlabSourceBranch     = context.gitlabSourceBranch?: params.GITLAB_BRANCH
context.gitlabTargetBranch     = context.gitlabTargetBranch?: context.gitlabSourceBranch
context.gitlabSourceNamespace  = context.gitlabSourceNamespace?: params.GITLAB_NAMESPACE
context.gitlabTargetNamespace  = context.gitlabTargetNamespace?: context.gitlabSourceNamespace
context.gitlabSourceRepoSshURL = context.gitlabSourceRepoSshURL?: params.GITLAB_SSH_URL
context.gitlabTargetRepoSshURL = context.gitlabTargetRepoSshURL?: context.gitlabSourceRepoSshURL


JupiterJob job = new JupiterJob(jenkins: this, context: context)
job.run()
