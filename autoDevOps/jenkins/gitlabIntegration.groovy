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
    Integer time = (null == args.timeout) ? 600: args.timeout
    Boolean activity = (null == args.activity) ? true: args.activity
    return timeout(time: time, activity: activity, unit: 'SECONDS') {
        stage(name, enable ? block : {
            echo "Skip stage: ${name}"
        })
    }
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

def updateRemoteLink(String remoteUri, String linkSource, String linkTarget) {
    assert '/' != linkTarget, 'What the hell are you doing?'
    // remove link if exists
    println sshCmd(remoteUri, "[ -L ${linkTarget} ] && unlink ${linkTarget} || true")
    // remote directory if exists
    println sshCmd(remoteUri, "[ -d ${linkTarget} ] && rm -rf ${linkTarget} || true")
    // create link to new target
    println sshCmd(remoteUri, "cp -r ${linkSource} ${linkTarget}")
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
    return branchName ==~ /^(develop)|(master)|(release.*)|(stage.*)$/
}

def buildReport(result, buildUrl, report) {
    List lines = []
    lines.push("**Build Result**: ${result}")
    lines.push("**Detail**: ${buildUrl}")
    if (null != report.saReport)
        lines.push("**Static Analysis**: ${report.saReport}")
    if (null != report.appUrl)
        lines.push("**Application URL**: ${report.appUrl}")
    if (null != report.coverage)
        lines.push("**Coverage Report**: ${report.coverage}")
    if (null != report.coverageDiff)
        lines.push("**Coverage Changes**: ${report.coverageDiff}")
    if (null != report.juiUrl)
        lines.push("**Storybook URL**: ${report.juiUrl}")
    if (null != report.e2eUrl)
        lines.push("**E2E Report**: ${report.e2eUrl}")
    return lines.join(' \n')
}

/* job params */
String jobName = env.JOB_BASE_NAME
String buildNode = env.BUILD_NODE
String scmCredentialId = env.SCM_CREDENTIAL
String npmRegistry = env.NPM_REGISTRY
String nodejsTool = env.NODEJS_TOOL
String deployUri = env.DEPLOY_URI
String deployCredentialId = env.DEPLOY_CREDENTIAL
String deployBaseDir = env.DEPLOY_BASE_DIR
String rcCredentialId = env.E2E_RC_CREDENTIAL

String releaseBranch = 'master'
String integrationBranch = 'develop'

/* build strategy */
Boolean isMerge = (null != env.gitlabTargetBranch) && (env.gitlabSourceBranch != env.gitlabTargetBranch)
Boolean skipEndToEnd = !isStableBranch(env.gitlabSourceBranch) && !isStableBranch(env.gitlabTargetBranch)
Boolean skipUpdateGitlabStatus = 'PUSH' == env.gitlabActionType && integrationBranch != env.gitlabSourceBranch
Boolean buildRelease = env.gitlabSourceBranch.startsWith('release') || env.gitlabSourceBranch.endsWith('release') || releaseBranch == env.gitlabSourceBranch

/* deploy params */
String subDomain = getSubDomain(env.gitlabSourceBranch, env.gitlabTargetBranch)
String appLinkDir = "${deployBaseDir}/${subDomain}".toString()
String appStageLinkDir = "${deployBaseDir}/stage".toString()
String juiLinkDir = "${deployBaseDir}/${subDomain}-jui".toString()

String appUrl = "https://${subDomain}.fiji.gliprc.com".toString()
String juiUrl = "https://${subDomain}-jui.fiji.gliprc.com".toString()

// following params should be updated after checkout stage success
String appHeadSha = null
String juiHeadSha = null

// update with +=
String appHeadShaDir = "${deployBaseDir}/app-".toString()
String juiHeadShaDir = "${deployBaseDir}/jui-".toString()

// by default we should not skip building app and jui
Boolean skipBuildApp = false
Boolean skipBuildJui = false
Boolean skipSaAndUt = false
Boolean skipInstallDependencies = false

// glip channel
def reportChannels = [
        env.gitlabUserEmail,
        getMessageChannel(env.gitlabSourceBranch, env.gitlabTargetBranch)
]

// report
Map report = [:]
report.buildUrl = env.BUILD_URL

// start to build
skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'pending')
cancelOldBuildOfSameCause()

node(buildNode) {
    skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'running')

    // install nodejs tool
    env.NODEJS_HOME = tool nodejsTool
    env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"
    env.TZ='UTC-8'

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
        }

        stage ('Checkout') {
            checkout ([
                    $class: 'GitSCM',
                    branches: [[name: "${env.gitlabSourceNamespace}/${env.gitlabSourceBranch}"]],
                    extensions: [
                            [$class: 'PruneStaleBranch'],
                            [$class: 'CleanBeforeCheckout'],
                            [
                                    $class: 'PreBuildMerge',
                                    options: [
                                            fastForwardMode: 'FF',
                                            mergeRemote: env.gitlabTargetNamespace?: env.gitlabSourceNamespace,
                                            mergeTarget: env.gitlabTargetBranch?: env.gitlabSourceBranch
                                    ]
                            ]
                    ],
                    userRemoteConfigs: [
                            [
                                    credentialsId: scmCredentialId,
                                    name: env.gitlabTargetNamespace,
                                    url: env.gitlabTargetRepoSshURL
                            ],
                            [
                                    credentialsId: scmCredentialId,
                                    name: env.gitlabSourceNamespace,
                                    url: env.gitlabSourceRepoSshURL
                            ]
                    ]
            ])
            // change in tests and autoDevOps directory should not trigger application build
            // for git 1.9, there is an easy way to exclude files
            // but most slaves are centos, whose git's version is still 1.8, we use a cmd pipeline here for compatibility
            appHeadSha = sh(returnStdout: true, script: '''ls -1 | grep -Ev '^(tests|autoDevOps)$' | tr '\\n' ' ' | xargs git rev-list -1 HEAD -- ''').trim()
            echo "appHeadSha=${appHeadSha}"
            assert appHeadSha, 'appHeadSha is invalid'
            appHeadShaDir += appHeadSha
            echo "appHeadShaDir=${appHeadShaDir}"
            // build jui only when packages/jui has change
            juiHeadSha = sh(returnStdout: true, script: '''git rev-list -1 HEAD -- packages/jui''').trim()
            echo "juiHeadSha=${juiHeadSha}"
            assert juiHeadSha, 'juiHeadSha is invalid'
            juiHeadShaDir += juiHeadSha
            echo "juiHeadShaDir=${juiHeadShaDir}"

            // check if app or jui has been built
            sshagent(credentials: [deployCredentialId]) {
                // we should always build release version
                skipBuildApp = doesRemoteDirectoryExist(deployUri, appHeadShaDir) && !buildRelease
                skipBuildJui = doesRemoteDirectoryExist(deployUri, juiHeadShaDir)
            }
            // since SA and UT must be passed before we build and deploy app and jui
            // that means if app and jui have already been built,
            // SA and UT must have already passed, we can just skip them to save more resources
            skipSaAndUt = skipBuildApp && skipBuildJui

            // we can even skip install dependencies
            skipInstallDependencies = [skipSaAndUt, skipEndToEnd].every()
        }

        condStage(name: 'Install Dependencies', enable: !skipInstallDependencies) {
            sh "echo 'registry=${npmRegistry}' > .npmrc"
            sh "[ -f package-lock.json ] && rm package-lock.json || true"
            sshagent (credentials: [scmCredentialId]) {
                sh 'npm install --only=dev --ignore-scripts --unsafe-perm'
                sh 'npm install --ignore-scripts --unsafe-perm'
                sh 'npx lerna bootstrap --hoist --no-ci --ignore-scripts'
            }
        }

        parallel (
                'Static Analysis': {
                    report.saReport = 'skip'
                    condStage(name: 'Static Analysis', enable: !skipSaAndUt) {
                        sh 'mkdir -p lint'
                        try {
                            [
                                    ['application', 'lint/application-tslint-report.txt'],
                                    ['packages/foundation', 'lint/foundation-tslint-report.txt'],
                                    ['packages/sdk', 'lint/sdk-tslint-report.txt'],
                                    ['packages/jui', 'lint/jui-tslint-report.txt'],

                            ].each {
                                sh "npx tslint --project ${it[0]} --out ${it[1]}"
                            }
                            report.saReport = "${SUCCESS_EMOJI} no tslint error"
                        } catch (e) {
                            String saErrorMessage = sh(returnStdout: true, script: 'cat lint/*.txt').trim()
                            report.saReport = "${FAILURE_EMOJI} ${saErrorMessage}"
                            throw e
                        }
                    }
                },

                'Unit Test': {
                    report.coverage = 'skip'
                    condStage(name: 'Unit Test', enable: !skipSaAndUt) {
                        sh 'npm run test:cover'
                        publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: false,
                                keepAll: true,
                                reportDir: 'coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Coverage',
                                reportTitles: 'Coverage'
                        ])
                        report.coverage = "${env.BUILD_URL}Coverage"
                        if (!isMerge && integrationBranch == env.gitlabSourceBranch) {
                            // attach coverage report as git note when new commits are pushed to integration branch
                            // push git notes to remote
                            sshagent (credentials: [scmCredentialId]) {
                                sh "git fetch -f ${env.gitlabSourceNamespace} refs/notes/*:refs/notes/*"
                                sh 'git notes add -f -F coverage/coverage-summary.json'
                                sh "git push -f ${env.gitlabSourceNamespace} refs/notes/*"
                            }
                        }
                        if (isMerge && integrationBranch == env.gitlabTargetBranch && fileExists('scripts/coverage-diff.js')) {
                            // compare coverage report with integration branch's
                            // step 1: fetch git notes
                            sshagent (credentials: [scmCredentialId]) {
                                sh "git fetch -f ${env.gitlabTargetNamespace} ${env.gitlabTargetBranch}"
                                sh "git fetch -f ${env.gitlabTargetNamespace} refs/notes/*:refs/notes/*"
                            }
                            // step 2: get latest commit on integration branch with notes
                            sh "git rev-list ${env.gitlabTargetNamespace}/${env.gitlabTargetBranch} > commit-sha.txt"
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
                                // TODO: throw exception when coverage drop
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
                            // and create link to branch name based folder
                            updateRemoteLink(deployUri, juiHeadShaDir, juiLinkDir)
                        }
                    }
                    report.juiUrl = juiUrl
                },

                'Build Application': {
                    condStage(name: 'Build Application', enable: !skipBuildApp) {
                        // FIXME: move this part to build script
                        sh 'npx ts-node application/src/containers/VersionInfo/GitRepo.ts'
                        sh 'mv commitInfo.ts application/src/containers/VersionInfo/'
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
                            // and create link to branch name based folder
                            updateRemoteLink(deployUri, appHeadShaDir, appLinkDir)
                            // for stage build, also create link to stage folder
                            if (!isMerge && env.gitlabSourceBranch.startsWith('stage'))
                                updateRemoteLink(deployUri, appHeadShaDir, appStageLinkDir)
                        }
                    }
                    report.appUrl = appUrl
                }
        )

        condStage (name: 'E2E Automation', timeout: 3600, enable: !skipEndToEnd) {
            String hostname =  sh(returnStdout: true, script: 'hostname -f').trim()
            String startTime = sh(returnStdout: true, script: "TZ=UTC-8 date +'%F %T'").trim()
            withEnv([
                    "HOST_NAME=${hostname}",
                    "SITE_URL=${appUrl}",
                    "SITE_ENV=${env.E2E_SITE_ENV}",
                    "SCREENSHOTS_PATH=${env.E2E_SCREENSHOTS_PATH}",
                    "SELENIUM_SERVER=${env.E2E_SELENIUM_SERVER}",
                    "ENABLE_REMOTE_DASHBOARD=${env.E2E_ENABLE_REMOTE_DASHBOARD}",
                    "BROWSERS=${env.E2E_BROWSERS}",
                    "CONCURRENCY=${env.E2E_CONCURRENCY}",
                    "BRANCH=${env.gitlabSourceBranch}",
                    "ACTION=ON_MERGE",
                    "DEBUG_MODE=false",
                    "QUARANTINE_MODE=true",
                    "STOP_ON_FIRST_FAIL=true",
                    "SCREENSHOT_WEBP_QUALITY=80",
                    "QUARANTINE_FAILED_THRESHOLD=4",
                    "QUARANTINE_PASSED_THRESHOLD=1",
                    "RUN_NAME=[Jupiter][Pipeline][Merge][${startTime}][${env.gitlabSourceBranch}][${env.gitlabMergeRequestLastCommit}]",
            ]) {dir("tests/e2e/testcafe") {
                sh 'env'
                sh "echo 'registry=${npmRegistry}' > .npmrc"
                sshagent (credentials: [scmCredentialId]) {
                    sh 'npm install --unsafe-perm'
                }
                if ('true' == env.E2E_ENABLE_REMOTE_DASHBOARD){
                    sh 'npx ts-node create-run-id.ts'
                    report.e2eUrl = sh(returnStdout: true, script: 'cat reportUrl || true').trim()
                } else {
                    report.e2eUrl = 'beat dashboard is disabled'
                }
                withCredentials([usernamePassword(
                        credentialsId: rcCredentialId,
                        usernameVariable: 'RC_PLATFORM_APP_KEY',
                        passwordVariable: 'RC_PLATFORM_APP_SECRET')]) {
                    sh "npm run e2e"
                }
            }}
        }
        skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'success')
        def description = currentBuild.getDescription() + '\n' + buildReport("${SUCCESS_EMOJI} Success", env.BUILD_URL, report)
        safeMail(
                reportChannels,
                "Jenkins Pipeline Success: ${currentBuild.fullDisplayName}",
                description,
        )
        currentBuild.setDescription(description)
    } catch (e) {
        skipUpdateGitlabStatus || updateGitlabCommitStatus(name: 'jenkins', state: 'failed')
        String statusTitle = "${FAILURE_EMOJI} Failure"
        if (e in InterruptedException)
            statusTitle = "${ABORTED_EMOJI} Aborted"
        def description = currentBuild.getDescription() + '\n' + buildReport(statusTitle, env.BUILD_URL, report)
        safeMail(
                reportChannels,
                "Jenkins Pipeline Stop: ${currentBuild.fullDisplayName}",
                description,
        )
        currentBuild.setDescription(description)
        throw e
    }
}