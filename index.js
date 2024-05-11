const core = require('@actions/core');
const github = require('@actions/github');

async function createReleaseBranch(baseBranch, releaseBranch){
    const date = new Date()
    core.debug(`Creating release branch from ${baseBranch}`)

    const toolkit = github.getOctokit(getGithubToken());

    try{
        await toolkit.rest.repos.getBranch({
            repo: github.context,
            branch: releaseBranch
        })
    } catch (err) {
        if (error.name === 'HttpError' && error.status === 404) {
            const branchCreated = await toolkit.rest.git.createRef({
                ref: releaseBranch,
                sha: context.sha,
                ...context.repo,
            });
      
            return branchCreated;
        } else {
            throw Error(err);
        }
    }
}

function getGithubToken(){
    const token = process.env.TOKEN;
    
    if(!token) throw new Error();

    return token;
}

function createRelease(releaseBranch){
    core.debug(`Creating release from branch ${releaseBranch}`)
}

async function run(){
    try {
        const baseBranch = core.getInput('base-branch');
        const releaseBranch = core.getInput('release-branch');
    
        const releaseBranchCreated = await createReleaseBranch(baseBranch, releaseBranch);
    
        const releaseCreated = createRelease(releaseBranch);
    
        core.setOutput('Release created', releaseCreated);
    } catch (err) {
        core.setFailed(err);
    }
}
run()