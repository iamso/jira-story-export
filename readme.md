# Jira Story Export

Export Jira stories into an HTML file. Can be used to share with people not in Jira or for archiving.

## Usage

Make sure there is a `.env` file containing the following information:

```bash
JIRA_USER=your@email.tld
JIRA_PW=your_password
JIRA_PROJECT=PRO
JIRA_URL=https://company.atlassian.net
JIRA_IGNORE="PRO-1,PRO-2" # optional
```

Then run `npm start` to export the stories and process them into an HTML file.
The HTML file will be located in the `public` folder.

## Deploy

The HTML file is self-contained, meaning it can be put in any directory on any webserver. There are no other files necessary. The stylesheet is loaded from a CDN.


## License

[DBAD](LICENSE)
