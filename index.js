const core = require('@actions/core');
const github = require('@actions/github');

async function createReleaseBranch(baseBranch, releaseBranch){
    const date = new Date();
    core.debug(`Creating release branch from ${baseBranch}`);

    releaseBranch = releaseBranch.replace('refs/heads/', '');
    const branch = `refs/heads/${releaseBranch}`;

    const toolkit = github.getOctokit(getGithubToken());

    try{
        core.debug(`Check if branch already exists`);

        await toolkit.rest.repos.getBranch({
            ...github.context.repo,
            branch
        })
    } catch (err) {
        if (err.name === 'HttpError' && err.status === 404) {
            core.debug(`Branch ${releaseBranch} doesn´t exists, creating branch from ${baseBranch}`);

            const branchCreated = await toolkit.rest.git.createRef({
                ref: branch,
                sha: github.context.sha,
                ...github.context.repo,
            });

            core.debug(`Branch ${releaseBranch} created`);
      
            return branchCreated;
        } else {
            core.debug(`A error occured while checking branch`);

            throw Error(err);
        }
    }
}

function getGithubToken(){
    const token = process.env.GITHUB_TOKEN;
    
    if(!token) throw new Error('No token defined in the environment variables');

    core.debug(`Github secrets loaded`);

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