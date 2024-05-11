const core = require('@actions/core');
const github = require('@actions/github');

async function createReleaseBranch(toolkit, baseBranch, releaseBranch){
    const date = new Date();
    core.info(`Creating release branch from ${baseBranch}`);

    releaseBranch = releaseBranch.replace('refs/heads/', '');
    const branch = `refs/heads/${releaseBranch}`;

    try{
        core.debug(`Check if branch already exists`);

        await toolkit.rest.repos.getBranch({
            ...github.context.repo,
            branch
        })

        core.info(`Branch ${releaseBranch} already exists`);
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
            core.error(`A error occured while checking branch`);

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

async function createRelease(toolkit, releaseBranch,  releaseTag){
    core.info(`Creating release from branch ${releaseBranch}`)

    await toolkit.rest.repos.createRelease({
        ...github.context.repo,
        generate_release_notes: true,
        tag_name: releaseTag,
        prerelease: true
    })

    core.info("Release created");
}

function loadInputs(){
    const baseBranch = core.getInput('base-branch');
    const releaseBranch = core.getInput('release-branch');
    const releaseTag = core.getInput('release-tag');

    return {baseBranch, releaseBranch, releaseTag}
}

function loadGithub(){
    try{
        return github.getOctokit(getGithubToken());
    } catch (err) {
        core.debug('Could not get github toolkit');
        throw err;
    }
}

async function run(){
    try {
        const {baseBranch, releaseBranch, releaseTag} = loadInputs();

        const toolkit = loadGithub()
  
        await createReleaseBranch(toolkit, baseBranch, releaseBranch);
    
        await createRelease(toolkit, releaseBranch, releaseTag);
    
        core.setOutput('Release created');
    } catch (err) {
        core.setFailed(err);
    }
}

run()