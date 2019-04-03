import jenkins.model.*
import java.net.URI
import com.dabsquared.gitlabjenkins.cause.GitLabWebHookCause

// glip emoji const set
final String SUCCESS_EMOJI = ':white_check_mark:'
final String FAILURE_EMOJI = ':negative_squared_cross_mark:'
final String ABORTED_EMOJI = ':no_entry:'
final String UPWARD_EMOJI = ':chart_with_upwards_trend:'
final String DOWNWARD_EMOJI = ':chart_with_downwards_trend:'

// cancel old build to safe slave resources
@NonCPS
def cancelOldBuildOfSameCause() {
    GitLabWebHookCause currentBuildCause = currentBuild.rawBuild.getCause(GitLabWebHookCause.class)
    if (null == currentBuildCause)
        return
    def currentCauseData = currentBuildCause.getData()

    currentBuild.rawBuild.getParent().getBuilds().each { build ->
        if (!build.isBuilding() || currentBuild.rawBuild.getNumber() <= build.getNumber())
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
            println "build ${build.getFullDisplayName()} is canceled"
        }
    }
}

// conditional stage
def condStage(Map args, Closure block) {
    assert args.name, 'stage name is required'
    String name = args.name
    Boolean enable = (null == args.enable) ? true: args.enable
    Integer time = (null == args.timeout) ? 1800: args.timeout
    Boolean activity = (null == args.activity) ? true: args.activity
    return timeout(time: time, activity: activity, unit: 'SECONDS') {
        stage(name, enable ? block : {
            echo "Skip stage: ${name}"
        })
    }
}

// generate sha1 hash from a git treeish object, ensure stability by only taking parent and tree object into account
def stableSha1(String treeish) {
    String cmd = "git cat-file commit ${treeish} | grep -e ^tree | openssl sha1 |  grep -oE '[^ ]+\$'".toString()
    return sh(returnStdout: true, script: cmd).trim()
}


// ssh helper
def sshCmd(String remoteUri, String cmd) {
    URI uri = new URI(remoteUri)
    GString sshCmd = "ssh -q -o StrictHostKeyChecking=no -p ${uri.getPort()} ${uri.getUserInfo()}@${uri.getHost()}"
    return sh(returnStdout: true, script: "${sshCmd} \"${cmd}\"").trim()
}

// deploy helper
def rsyncFolderToRemote(String sourceDir, String remoteUri, String remoteDir) {
    URI uri = new URI(remoteUri)
    sshCmd(remoteUri, "mkdir -p ${remoteDir}".toString())
    String rsyncRemoteUri = "${uri.getUserInfo()}@${uri.getHost()}:${remoteDir}".toString()
    sh "rsync -azPq --delete --progress -e 'ssh -o StrictHostKeyChecking=no -p ${uri.getPort()}' ${sourceDir} ${rsyncRemoteUri}"
    sshCmd(remoteUri, "chmod -R 755 ${remoteDir}".toString())
}

def doesRemoteDirectoryExist(String remoteUri, String remoteDir) {
    // the reason to use stdout instead of return code is,
    // by return code we can not tell the error of ssh itself or dir not exists
    return 'true' == sshCmd(remoteUri, "[ -d ${remoteDir} ] && echo 'true' || echo 'false'")
}

def updateRemoteCopy(String remoteUri, String linkSource, String linkTarget) {
    assert '/' != linkTarget, 'What the hell are you doing?'
    // remove link if exists
    println sshCmd(remoteUri, "[ -L ${linkTarget} ] && unlink ${linkTarget} || true")
    // remote directory if exists
    println sshCmd(remoteUri, "[ -d ${linkTarget} ] && rm -rf ${linkTarget} || true")
    // create copy to new target
    println sshCmd(remoteUri, "cp -r ${linkSource} ${linkTarget}")
}

def updateVersionInfo(String remoteUri, String appDir, String sha, long timestamp) {
    String cmd = "sed -i 's/{{deployedCommit}}/${sha.substring(0,9)}/;s/{{deployedTime}}/${timestamp}/' ${appDir}/static/js/versionInfo.*.chunk.js || true"
    println sshCmd(remoteUri, cmd)
}

def createRemoteTarbar(String remoteUri, String sourceDir, String targetDir, String filename) {
    // 1. ensure targetDir is existed
    println sshCmd(remoteUri, "mkdir -p ${targetDir}")
    // 2. cd to publishDir and create tar.gz file from deployDir
    println sshCmd(remoteUri, "cd ${targetDir} && tar -czvf ${filename} -C ${sourceDir} .")
}

// business logic
static String getSubDomain(String sourceBranch, String targetBranch) {
    if ("master" == sourceBranch)
        return 'release'
    if (sourceBranch in ["develop", "stage"])
        return sourceBranch
    String subDomain = sourceBranch.replaceAll(/[\/\.]/, '-').toLowerCase()
    if (null != targetBranch && sourceBranch != targetBranch)
        return "mr-${subDomain}".toString()
    return subDomain
}

static String getMessageChannel(String sourceBranch, String targetBranch) {
    if (null != targetBranch && sourceBranch != targetBranch)
        return "jupiter_mr_ci@ringcentral.glip.com"
    switch (sourceBranch) {
        case "master": return "jupiter_master_ci@ringcentral.glip.com"
        case "develop": return "jupiter_develop_ci@ringcentral.glip.com"
        default: return "jupiter_push_ci@ringcentral.glip.com"
    }
}

def safeMail(addresses, subject, body) {
    addresses.each {
        try {
            mail to: it, subject: subject, body: body
        } catch (e) {
            println e
        }
    }
}

def isStableBranch(String branchName) {
    if (null == branchName)
        return false
    return branchName ==~ /^(develop)|(master)|(release.*)|(stage.*)|(hotfix.*)$/
}

// report helper
def aTagToGlipLink(String html) {
    return html.replaceAll(/<a\b[^>]*?href="(.*?)"[^>]*?>(.*?)<\/a>/, '[$2]($1)')
}

def aTagToUrl(String html) {
    return html.replaceAll(/<a\b[^>]*?href="(.*?)"[^>]*?>(.*?)<\/a>/, '$1')
}

def urlToATag(String url) {
    return """<a href="${url}">${url}</a>"""
}

def formatGlipReport(report) {
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

def formatJenkinsReport(report) {
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

/* job params */
String buildNode = params.BUILD_NODE ?: env.BUILD_NODE
String scmCredentialId = params.SCM_CREDENTIAL
String npmRegistry = params.NPM_REGISTRY
String nodejsTool = params.NODEJS_TOOL
String deployUri = params.DEPLOY_URI
String deployCredentialId = params.DEPLOY_CREDENTIAL
String deployBaseDir = params.DEPLOY_BASE_DIR
String rcCredentialId = params.E2E_RC_CREDENTIAL

String releaseBranch = 'master'
String integrationBranch = 'develop'

/* gitlab params and env vars */
String buildUrl = env.BUILD_URL
String gitlabSourceBranch = env.gitlabSourceBranch?: params.GITLAB_BRANCH
String gitlabTargetBranch = env.gitlabTargetBranch?: gitlabSourceBranch
String gitlabSourceNamespace = env.gitlabSourceNamespace?: params.GITLAB_NAMESPACE
String gitlabTargetNamespace = env.gitlabTargetNamespace?: gitlabSourceNamespace
String gitlabSourceRepoSshURL = env.gitlabSourceRepoSshURL?: params.GITLAB_SSH_URL
String gitlabTargetRepoSshURL = env.gitlabTargetRepoSshURL?: gitlabSourceRepoSshURL
String gitlabUserEmail = env.gitlabUserEmail
String gitlabMergeRequestLastCommit = env.gitlabMergeRequestLastCommit

/* e2e params vars */
String e2eSiteEnv = params.E2E_SITE_ENV
String e2eSeleniumServer = params.E2E_SELENIUM_SERVER
String e2eBrowsers = params.E2E_BROWSERS
String e2eConcurrency = params.E2E_CONCURRENCY
String e2eExcludeTags = params.E2E_EXCLUDE_TAGS?: ''
Boolean e2eEnableRemoteDashboard = params.E2E_ENABLE_REMOTE_DASHBOARD
Boolean e2eEnableMockServer = params.E2E_ENABLE_MOCK_SERVER

/* build strategy */
Boolean isMerge = gitlabSourceBranch != gitlabTargetBranch
// skip e2e when neither source or target branch is stable branch.
// won't skip e2e when configuration file of source branch exists
Boolean skipEndToEnd = !isStableBranch(gitlabSourceBranch) && !isStableBranch(gitlabTargetBranch)
// update status for merge request event and new push on stable branch
Boolean skipUpdateGitlabStatus = !isMerge && integrationBranch != gitlabTargetBranch
// create release build when targetBranch match specific name pattern
Boolean buildRelease = gitlabTargetBranch.startsWith('release') || gitlabTargetBranch.endsWith('release') ||
    releaseBranch == gitlabTargetBranch

/* deploy params */
// generate subDomain name from branch name, and then we can decide deploy directory and url
String subDomain = getSubDomain(gitlabSourceBranch, gitlabTargetBranch)
String appLinkDir = "${deployBaseDir}/${subDomain}".toString()
String appStageLinkDir = "${deployBaseDir}/stage".toString()
String juiLinkDir = "${deployBaseDir}/${subDomain}-jui".toString()
String publishDir = "${deployBaseDir}/publish".toString()

String appUrl = "https://${subDomain}.fiji.gliprc.com".toString()
String juiUrl = "https://${subDomain}-jui.fiji.gliprc.com".toString()
String publishPackageName = "${subDomain}.tar.gz".toString()
String publishUrl = "https://publish.fiji.gliprc.com/${publishPackageName}".toString()

// following params should be updated after checkout stage success
String headSha = null
String appHeadSha = null
String juiHeadSha = null

// update with +=
// release build use different build command, we should distinguish it from other build by using different name pattern
String appHeadShaDir = "${deployBaseDir}/app-${buildRelease ? 'release-' : ''}".toString()
String juiHeadShaDir = "${deployBaseDir}/jui-".toString()

// by default we should not skip building app and jui
Boolean skipBuildApp = false
Boolean skipBuildJui = false
Boolean skipSaAndUt = false
Boolean skipInstallDependencies = false

// glip channel
def reportChannels = [
    getMessageChannel(gitlabSourceBranch, gitlabTargetBranch)
]
// send report to owner if gitlabUserEmail is provided
if (gitlabUserEmail) {
    reportChannels.push(gitlabUserEmail)
    reportChannels.push(gitlabUserEmail.replaceAll('ringcentral.com', 'ringcentral.glip.com'))
}


// report
Map report = [:]
report.buildUrl = buildUrl

// start to build
skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'pending')
cancelOldBuildOfSameCause()

node(buildNode) {
    skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'running')

    // install nodejs tool and update environment variables
    env.NODEJS_HOME = tool nodejsTool
    env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"
    env.TZ='UTC-8'
    env.NODE_ENV='development'
    env.SENTRYCLI_CDNURL='https://cdn.npm.taobao.org/dist/sentry-cli'

    try {
        // start to build
        stage ('Collect Facts') {
            sh 'env'
            sh 'df -h'
            sh 'uptime'
            sh 'git --version'
            sh 'node -v'
            sh 'rsync --version'
            sh 'grep --version'
            sh 'which tr'
            sh 'which xargs'

            // clean npm cache when its size exceed 10G, the unit of default du command is K, so we need to right-shift 20 to get G
            long npmCacheSize = Long.valueOf(sh(returnStdout: true, script: 'du -s $(npm config get cache) | cut -f1').trim()) >> 20
            if (npmCacheSize > 10) {
                sh 'npm cache clean --force'
            }
        }

        stage ('Checkout') {
            checkout ([
                $class: 'GitSCM',
                branches: [[name: "${gitlabSourceNamespace}/${gitlabSourceBranch}"]],
                extensions: [
                    [$class: 'PruneStaleBranch'],
                    [
                        $class: 'PreBuildMerge',
                        options: [
                            fastForwardMode: 'FF',
                            mergeRemote: gitlabTargetNamespace,
                            mergeTarget: gitlabTargetBranch,
                        ]
                    ]
                ],
                userRemoteConfigs: [
                    [
                        credentialsId: scmCredentialId,
                        name: gitlabTargetNamespace,
                        url: gitlabTargetRepoSshURL,
                    ],
                    [
                        credentialsId: scmCredentialId,
                        name: gitlabSourceNamespace,
                        url: gitlabSourceRepoSshURL
                    ]
                ]
            ])
            // keep node_modules to speed up build process
            sh 'git clean -xdf -e node_modules'
            // get head sha
            headSha = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
            // change in tests and autoDevOps directory should not trigger application build
            // for git 1.9, there is an easy way to exclude files
            // but most slaves are centos, whose git's version is still 1.8, we use a cmd pipeline here for compatibility
            appHeadSha = sh(returnStdout: true, script: '''ls -1 | grep -Ev '^(tests|autoDevOps)$' | tr '\\n' ' ' | xargs git rev-list -1 HEAD -- ''').trim()
            if (isMerge && headSha == appHeadSha) {
                // the reason to use stableSha here is if HEAD is generate via fast-forward, the commit will be changed when re-running the job due to timestamp changed
                echo "generate stable sha1 key from ${appHeadSha}"
                appHeadSha = stableSha1(appHeadSha)
            }

            echo "appHeadSha=${appHeadSha}"
            assert appHeadSha, 'appHeadSha is invalid'
            appHeadShaDir += appHeadSha
            echo "appHeadShaDir=${appHeadShaDir}"
            // build jui only when packages/jui has change
            juiHeadSha = sh(returnStdout: true, script: '''git rev-list -1 HEAD -- packages/jui''').trim()
            if (isMerge && headSha == juiHeadSha) {
                // same as appHeadSha
                echo "generate stable sha1 key from ${juiHeadSha}"
                juiHeadSha = stableSha1(juiHeadSha)
            }
            echo "juiHeadSha=${juiHeadSha}"
            assert juiHeadSha, 'juiHeadSha is invalid'
            juiHeadShaDir += juiHeadSha
            echo "juiHeadShaDir=${juiHeadShaDir}"

            // check if app or jui has been built
            sshagent(credentials: [deployCredentialId]) {
                // we should always build release version
                skipBuildApp = doesRemoteDirectoryExist(deployUri, appHeadShaDir)
                skipBuildJui = doesRemoteDirectoryExist(deployUri, juiHeadShaDir)
            }
            // since SA and UT must be passed before we build and deploy app and jui
            // that means if app and jui have already been built,
            // SA and UT must have already passed, we can just skip them to save more resources
            skipSaAndUt = skipBuildApp && skipBuildJui

            skipBuildApp = skipBuildApp && !buildRelease

            // we can even skip install dependencies
            skipInstallDependencies = skipSaAndUt

            // don't skip e2e if configuration file exists
            skipEndToEnd = skipEndToEnd && !fileExists("tests/e2e/testcafe/configs/${gitlabSourceBranch}.json")
        }

        condStage(name: 'Install Dependencies', enable: !skipInstallDependencies) {
            try {
                sh 'npm run fixed:version pre'
            } catch (e) { }
            sh "echo 'registry=${npmRegistry}' > .npmrc"
            sshagent (credentials: [scmCredentialId]) {
                sh 'npm install @babel/parser@7.3.3'
                sh 'npm install --only=dev --ignore-scripts'
                sh 'npm install --ignore-scripts'
                sh 'npm install'
                sh 'npx lerna bootstrap --hoist --no-ci --ignore-scripts'

            }
            try {
                sh 'npm run fixed:version check'
                sh 'npm run fixed:version cache'
            } catch (e) { }
        }

        parallel (
            'Static Analysis': {
                report.saReport = 'skip'
                condStage(name: 'Static Analysis', enable: !skipSaAndUt) {
                    sh 'mkdir -p lint'
                    try {
                        sh 'npm run lint-all > lint/report.txt'
                        report.saReport = "${SUCCESS_EMOJI} no tslint error"
                    } catch (e) {
                        String saErrorMessage = sh(returnStdout: true, script: 'cat lint/report.txt').trim()
                        report.saReport = "${FAILURE_EMOJI} ${saErrorMessage}"
                        throw e
                    }
                }
            },

            'Unit Test': {
                report.coverage = 'skip'
                condStage(name: 'Unit Test', enable: !skipSaAndUt) {
                    sh 'npm run test -- --coverage -w 4'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: false,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage',
                        reportTitles: 'Coverage'
                    ])
                    report.coverage = "${buildUrl}Coverage"
                    // this is a work around
                    if (!fileExists('coverage/coverage-summary.json')) {
                        sh 'echo "{}" > coverage/coverage-summary.json'
                    }
                    if (!isMerge && integrationBranch == gitlabTargetBranch) {
                        // attach coverage report as git note when new commits are pushed to integration branch
                        // push git notes to remote
                        sshagent (credentials: [scmCredentialId]) {
                            sh "git fetch -f ${gitlabSourceNamespace} refs/notes/*:refs/notes/*"
                            sh "git notes add -f -F coverage/coverage-summary.json ${appHeadSha}"
                            sh "git push -f ${gitlabSourceNamespace} refs/notes/*"
                        }
                    }
                    if (isMerge && integrationBranch == gitlabTargetBranch && fileExists('scripts/coverage-diff.js')) {
                        // compare coverage report with integration branch's
                        // step 1: fetch git notes
                        sshagent (credentials: [scmCredentialId]) {
                            sh "git fetch -f ${gitlabTargetNamespace} ${gitlabTargetBranch}"
                            sh "git fetch -f ${gitlabTargetNamespace} refs/notes/*:refs/notes/*"
                        }
                        // step 2: get latest commit on integration branch with notes
                        sh "git rev-list ${gitlabTargetNamespace}/${gitlabTargetBranch} > commit-sha.txt"
                        sh "git notes | cut -d ' ' -f 2 > note-sha.txt"
                        String latestCommitWithNote = sh(returnStdout: true, script: "grep -Fx -f note-sha.txt commit-sha.txt | head -1").trim()
                        // step 3: compare with baseline
                        if (latestCommitWithNote) {
                            sh "git notes show ${latestCommitWithNote} > baseline-coverage-summary.json"
                            int exitCode = sh(
                                returnStatus: true,
                                script: "node scripts/coverage-diff.js baseline-coverage-summary.json coverage/coverage-summary.json > coverage-diff",
                            )
                            report.coverageDiff = exitCode ? FAILURE_EMOJI : SUCCESS_EMOJI;
                            report.coverageDiff += sh(returnStdout: true, script: 'cat coverage-diff').trim()
                            if (exitCode > 0) {
                                // throw new Exception('coverage drop!')
                            }
                        }
                    }
                }
            }
        )

        parallel (
            'Build JUI' : {
                condStage(name: 'Build JUI', enable: !skipBuildJui) {
                    sh 'npm run build:ui'
                }

                condStage(name: 'Deploy JUI') {
                    String sourceDir = "packages/jui/storybook-static/"  // !!! don't forget trailing '/'
                    sshagent(credentials: [deployCredentialId]) {
                        // copy to dir name with head sha when dir is not exists
                        skipBuildJui || rsyncFolderToRemote(sourceDir, deployUri, juiHeadShaDir)
                        // and create copy to branch name based folder
                        updateRemoteCopy(deployUri, juiHeadShaDir, juiLinkDir)
                    }
                }
                report.juiUrl = juiUrl
            },

            'Build Application': {
                condStage(name: 'Build Application', enable: !skipBuildApp) {
                    // FIXME: move this part to build script
                    sh 'npx ts-node application/src/containers/VersionInfo/GitRepo.ts'
                    sh 'mv commitInfo.ts application/src/containers/VersionInfo/'
                    try {
                        // fix FIJI-4534
                        long timestamp = System.currentTimeMillis();
                        sh "sed 's/{{buildCommit}}/${headSha.substring(0, 9)}/;s/{{buildTime}}/${timestamp}/' application/src/containers/VersionInfo/versionInfo.json > versionInfo.json"
                        sh 'mv versionInfo.json application/src/containers/VersionInfo/versionInfo.json'
                    } catch (e) {}
                    if (buildRelease) {
                        sh 'npm run build:release'
                    } else {
                        dir('application') {
                            sh 'npm run build'
                        }
                    }
                }

                condStage(name: 'Deploy Application') {
                    String sourceDir = "application/build/"  // !!! don't forget trailing '/'
                    sshagent(credentials: [deployCredentialId]) {
                        // copy to dir name with head sha when dir is not exists
                        skipBuildApp || rsyncFolderToRemote(sourceDir, deployUri, appHeadShaDir)
                        // and create copy to branch name based folder
                        updateRemoteCopy(deployUri, appHeadShaDir, appLinkDir)
                        // and update version info
                        long ts = System.currentTimeMillis()
                        updateVersionInfo(deployUri, appLinkDir, headSha, ts)
                        // for stage build, also create link to stage folder
                        if (!isMerge && gitlabSourceBranch.startsWith('stage'))
                            updateRemoteCopy(deployUri, appHeadShaDir, appStageLinkDir)
                        // for release build, we should also create a tar.gz package for deployment
                        if (buildRelease) {
                            createRemoteTarbar(deployUri, appHeadShaDir, publishDir, publishPackageName)
                            report.publishUrl = publishUrl
                        }
                    }
                }
                report.appUrl = appUrl
            }
        )

        condStage(name: 'Telephony Automation', timeout: 600) {
            try {
                if (!isMerge && 'POC/FIJI-1302' == gitlabSourceBranch) {
                    build(job: 'Jupiter-telephony-automation', parameters: [
                        [$class: 'StringParameterValue', name: 'BRANCH', value: 'POC/FIJI-1302'],
                        [$class: 'StringParameterValue', name: 'JUPITER_URL', value: appUrl],
                    ])
                }
            } catch (e) {}
        }

        condStage (name: 'E2E Automation', timeout: 3600, enable: !skipEndToEnd) {
            String hostname =  sh(returnStdout: true, script: 'hostname -f').trim()
            String startTime = sh(returnStdout: true, script: "TZ=UTC-8 date +'%F %T'").trim()
            withEnv([
                "HOST_NAME=${hostname}",
                "SITE_URL=${appUrl}",
                "SITE_ENV=${e2eSiteEnv}",
                "SELENIUM_SERVER=${e2eSeleniumServer}",
                "SELENIUM_CHROME_CAPABILITIES=./chrome-opts.json",
                "ENABLE_REMOTE_DASHBOARD=${e2eEnableRemoteDashboard}",
                "ENABLE_MOCK_SERVER=${e2eEnableMockServer}",
                "BROWSERS=${e2eBrowsers}",
                "CONCURRENCY=${e2eConcurrency}",
                "EXCLUDE_TAGS=${e2eExcludeTags}",
                "BRANCH=${gitlabSourceBranch}",
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
                "RUN_NAME=[Jupiter][Pipeline][Merge][${startTime}][${gitlabSourceBranch}][${gitlabMergeRequestLastCommit}]",
            ]) {dir("tests/e2e/testcafe") {
                // print environment variable to help debug
                sh 'env'

                // following configuration file is use for tuning chrome, in order to use use-data-dir and disk-cache-dir
                // you need to ensure target dirs exist in selenium-node, and use ramdisk for better performance
                sh '''echo '{"chromeOptions":{"args":["headless"]}}' > chrome-opts.json'''

                sh "mkdir -p screenshots tmp"
                sh "echo 'registry=${npmRegistry}' > .npmrc"
                sshagent (credentials: [scmCredentialId]) {
                    sh 'npm install --unsafe-perm'
                }

                if (e2eEnableRemoteDashboard){
                    sh 'npx ts-node create-run-id.ts'
                    report.e2eUrl = sh(returnStdout: true, script: 'cat reportUrl || true').trim()
                } else {
                    report.e2eUrl = 'beat dashboard is disabled'
                }
                withCredentials([usernamePassword(
                    credentialsId: rcCredentialId,
                    usernameVariable: 'RC_PLATFORM_APP_KEY',
                    passwordVariable: 'RC_PLATFORM_APP_SECRET')]) {
                    try {
                        sh "npm run e2e"
                    } finally {
                        if (!e2eEnableRemoteDashboard) {
                            sh "tar -czvf allure.tar.gz -C ./allure/allure-results . || true"
                            archiveArtifacts artifacts: 'allure.tar.gz', fingerprint: true
                        }
                        // TODO: else: close beat report properly
                    }
                }
            }}
        }
        // post success actions
        skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'success')
        report.description = currentBuild.getDescription()
        report.jobUrl = buildUrl
        report.buildResult = "${SUCCESS_EMOJI} Success"
        currentBuild.setDescription(formatJenkinsReport(report))
        safeMail(reportChannels, "Jenkins Pipeline Success: ${currentBuild.fullDisplayName}", formatGlipReport(report))
    } catch (e) {
        // post failure actions
        skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'failed')
        report.description = currentBuild.getDescription()
        report.jobUrl = buildUrl
        report.buildResult = "${FAILURE_EMOJI} Failure"
        if (e in InterruptedException)
            report.buildResult = "${ABORTED_EMOJI} Aborted"
        currentBuild.setDescription(formatJenkinsReport(report))
        safeMail(reportChannels, "Jenkins Pipeline Stop: ${currentBuild.fullDisplayName}", formatGlipReport(report))
        throw e
    }
}
