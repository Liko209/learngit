# RCUI

## Setup
Install the dependencies with npm
```shell
npm install
npm run storybook
```
## Git flow
### New Feature
  - Create a branch from `dev`, Let's call it `feature/demo`
  - Developer works on `feature/demo`
  - Developer gets updates from `dev` when needed (by mergin dev in). eg. `git pull origin dev`
  - Developer publishes `feature/demo`
    1. Developer does a final update from `dev`
    2. Developer makes sure their tests and lint pass locally
    3. Developer pushes `feature/demo`
    4. Developer makes sure their tests and deploy success on the pipeline
  - Developer submits pull request to dev
    1. Admin merges pull request into dev branch and codebase will be deployed to dev environment for designer
  - Release
    1. Once it's time for a release, release branch should be created from the dev branch and tagged it. then merge it into `master` and `dev` branches.

### Hotfix
  - If a bug should be fixed quickly, hotfix branch should be created from `master`, Let's call it `hotfix/bug1`
  - Developer works on `hotfix/bug1`
  - Developer publishes `hotfix/bug1`
    1. Developer does a final update from `master`
    2. Developer makes sure their tests and lint be passed locally
    3. Developer pushes `hotfix/bug1`
    4. Developer makes sure pipeline is successed and designer checking is passed
  - Admin merges `hotfix/bug1` into `master` and `dev`, then tagged it. 

## Commit Policy
  - Purpose
    - Code quality when merging code
    - Easy to code review
    - Clean code history
  - Policy
    - Always merge to which branch it base on
    - All merge should have code review
    - One merge, one ticket
    - Commit what is need commit
      - One commit, one issue
      - Use the same code format plugin
        - Prettier
    - Criteria for merge into develop branch
      - No p0/p1 bugs
      - No p2 bugs
        - If have to merge into develop with remain P2 bugs, get agreement from QA and Leader
      - Owner: QA
    - Conflict
      - Should talk to the original code author
  - Commit message format
    - Commit message format should follow:
      - feat(JIRA-ticket): Ticket title
      - feat(JIRA-ticket): [Ticket title] Description
    - Merge request title
      - feat(JIRA-ticket): Ticket title
    - Post both the CR link and title in Jupiter Code Review team

## Continuous Integration
  ### Trigger point
    1. commit
    2. merge_request
    3. merge
    4. tags
  
  ### Testing
  Every times we push/merge/merge_requests/tags to any branches , test phase will be executed

  ### Deploy
  Deploy only triggered on `master` , `dev` and `hotfix/**` branches with any action(eg. pust/merge_request/merge/tag), *storybook website* and *docs website* will be deployed. QA and designers will review and manully test on the website.

  ### Environment
  ```shell
  # dev
  storybook: http://rcui-dev.s3-website-us-east-1.amazonaws.com

  # production
  storybook: http://rcui.s3-website-us-east-1.amazonaws.com
  
  # docs(Currently, docs have only one env)
  docs: http://rcui-docs.s3-website-us-east-1.amazonaws.com/
  ```
