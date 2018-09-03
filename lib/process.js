const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const rimraf = require('rimraf');
const ejs = require('ejs');
const motesMd = require('motes-md')({
  hashtag: false,
  mention: false,
  tocLevel: [1,2],
  containers: [
    'container',
    'story',
    'comment',
    'attachments',
    'side-nav',
  ]
});
const moment = require('moment');

const pubDir = path.join(path.dirname(require.main.filename),'public');
const encoding = 'UTF-8';
const dateFormat = 'DD.MM.YYYY HH:mm';
const ignore = process.env.JIRA_IGNORE ? process.env.JIRA_IGNORE.split(',') : [];

const storyTemplate = fs.readFileSync(path.join(path.dirname(require.main.filename),'views', 'story.ejs'), encoding);
const pageTemplate = fs.readFileSync(path.join(path.dirname(require.main.filename),'views', 'page.ejs'), encoding);

function sortByCreated(a,b) {
  return a.created - b.created;
}

function renderStory(story) {
  return ejs.render(storyTemplate, story);
}

function renderPage(md) {
  let env = {};
  const output = motesMd.render(md, env);
  const html = ejs.render(pageTemplate, {output: output});
  return html;
}

module.exports = (issueData) => {
  const issues = {};

  let mdOutput = `

  [[toc]]

  `;

  issueData.reverse();

  for (let issue of issueData) {
    const data = {
      key: issue.key,
      type: issue.fields.issuetype.name,
      status: issue.fields.status.name,
      title: issue.fields.summary,
      description: issue.fields.description,
      comments: [],
      subtasks: [],
      attachments: [],
    };

    if (issue.fields.comment.comments && issue.fields.comment.comments.length) {
      for (let comment of issue.fields.comment.comments) {
        data.comments.push({
          author: {
            name: comment.author.displayName,
            email: comment.author.emailAddress,
            avatar: comment.author.avatarUrls['48x48']
          },
          text: comment.body,
          created: moment(comment.created, 'x'),
        });
      }
    }

    if (issue.fields.subtasks && issue.fields.subtasks.length) {
      for (let subtask of issue.fields.subtasks) {
        data.subtasks.push(subtask.key);
      }
    }

    if (issue.fields.attachment && issue.fields.attachment.length) {
      for (let attachment of issue.fields.attachment) {
        data.attachments.push({
          author: {
            name: attachment.author.displayName,
            email: attachment.author.emailAddress,
            avatar: attachment.author.avatarUrls['48x48']
          },
          name: attachment.filename,
          file: attachment.content,
          created: moment(attachment.created, 'x'),
        });
      }
    }

    issues[issue.key] = data;
  }

  for (let key in issues) {
    const issue = issues[key];

    const data = {};

    if (issue.type === 'Story' && issue.status === 'Done' && !ignore.includes(key)) {
      data.key = issue.key;
      data.title = issue.title;
      data.description = issue.description;

      data.comments = issue.comments;
      data.attachments = issue.attachments;

      for (let subtask of issue.subtasks) {
        subtask = issues[subtask];
        data.comments = data.comments.concat(subtask.comments);
        data.attachments = data.attachments.concat(subtask.attachments);
        data.comments.sort(sortByCreated);
        data.attachments.sort(sortByCreated);
      }

      mdOutput += renderStory(data);
    }
  }

  fse.outputFileSync(path.join(pubDir, 'index.html'), renderPage(mdOutput));

  console.log('all done, homes!');
};
