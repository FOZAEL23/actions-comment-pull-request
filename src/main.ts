import * as github from '@actions/github';
import * as core from '@actions/core';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';

async function run() {
  try {
    let message: string = core.getInput('message');
    const github_token: string = core.getInput('GITHUB_TOKEN');
    const pr_number: string = core.getInput('pr_number');

    if (!message) {
      throw new Error('message input should be provided!');
    }

    const context = github.context;
    const pull_number = parseInt(pr_number) || context.payload.pull_request?.number;

    const octokit = github.getOctokit(github_token);

    if (!pull_number) {
      core.setFailed('No pull request in input neither in current context.');
      return;
    }

    // type ListCommentsResponseDataType = GetResponseDataTypeFromEndpointMethod<
    //   typeof octokit.rest.issues.listComments
    // >;
    // let comment: ListCommentsResponseDataType[0] | undefined;
    // for await (const { data: comments } of octokit.paginate.iterator(octokit.rest.issues.listComments, {
    //   ...context.repo,
    //   issue_number: pull_number,
    // })) {
    //   comment = comments.find((comment) => comment?.body?.includes(message));
    //   await octokit.rest.issues.updateComment({
    //     ...context.repo,
    //     comment_id: comment,
    //     body: message,
    //   });
    // }

    //  get all comments from all pages
    const { data: comments } = await octokit.rest.issues.listComments({
      ...context.repo,
      issue_number: pull_number,
    });

    await octokit.rest.issues.updateComment({
      ...context.repo,
      comment_id: comments[0].id,
      body: message,
    });


  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
