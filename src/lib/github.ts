// src/lib/github.ts
import { Octokit } from '@octokit/rest';
import type {
    CheckRepositoryResult,
    CreateRepositoryResult,
    CommitFileResult,
    RepositoryResponse,
    GitHubAPIError
} from '../types/github';

export async function checkRepository(accessToken: string): CheckRepositoryResult {
    const octokit = new Octokit({ auth: accessToken });

    try {
        const { data: user } = await octokit.users.getAuthenticated();
        await octokit.repos.get({
            owner: user.login,
            repo: 'lawn-diary'
        });
        return true;
    } catch (error) {
        const apiError = error as GitHubAPIError;
        if (apiError.message === 'Not Found') {
            return false;
        }
        throw error;
    }
}

export async function createRepository(accessToken: string): CreateRepositoryResult {
    const octokit = new Octokit({ auth: accessToken });

    try {
        await octokit.repos.createForAuthenticatedUser({
            name: 'lawn-diary',
            description: '매일 일기를 작성하고 잔디를 심어보세요',
            auto_init: true
        });
    } catch (error) {
        const apiError = error as GitHubAPIError;
        throw new Error(`Failed to create repository: ${apiError.message}`);
    }
}

export async function commitFile(
    accessToken: string,
    content: string,
    path: string
): CommitFileResult {
    const octokit = new Octokit({ auth: accessToken });

    try {
        const { data: user } = await octokit.users.getAuthenticated();
        const username = user.login;

        // Get the default branch
        const { data: repo } = await octokit.repos.get({
            owner: username,
            repo: 'lawn-diary'
        }) as { data: RepositoryResponse };

        const defaultBranch = repo.default_branch;

        // Get the latest commit SHA
        const { data: ref } = await octokit.git.getRef({
            owner: username,
            repo: 'lawn-diary',
            ref: `heads/${defaultBranch}`
        });

        // Create blob with file content
        const { data: blob } = await octokit.git.createBlob({
            owner: username,
            repo: 'lawn-diary',
            content,
            encoding: 'utf-8'
        });

        // Create tree
        const { data: tree } = await octokit.git.createTree({
            owner: username,
            repo: 'lawn-diary',
            base_tree: ref.object.sha,
            tree: [{
                path,
                mode: '100644',
                type: 'blob',
                sha: blob.sha
            }]
        });

        // Create commit
        const { data: commit } = await octokit.git.createCommit({
            owner: username,
            repo: 'lawn-diary',
            message: `Add diary: ${new Date().toISOString().split('T')[0]}`,
            tree: tree.sha,
            parents: [ref.object.sha]
        });

        // Update ref
        await octokit.git.updateRef({
            owner: username,
            repo: 'lawn-diary',
            ref: `heads/${defaultBranch}`,
            sha: commit.sha
        });

        return true;
    } catch (error) {
        const apiError = error as GitHubAPIError;
        console.error('GitHub API Error:', apiError);
        throw error;
    }
}