/**
 * @copyright Copyright (c) 2020 Ryan Spoone
 */

'use strict';

require('dotenv').config();
const _ = require('lodash');
const Mustache = require('mustache');
const fetch = require('isomorphic-fetch');
const fs = require('fs');
const Parser = require('rss-parser');

const DATA = {
    refreshDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
        timeZone: 'America/Chicago'
    }),
    latestBlogPosts: '<ul><li>Not available</li></ul>'
};

const setBlogPosts = async () => {
    try {
        const parser = new Parser();
        const { items } = await parser.parseURL(
            'https://www.ryanspoone.com/admin/6e77be03b4b76fc45615cb2967af11/rss/'
        );

        let posts = ['<ul>'];
        if (!_.isEmpty(items)) {
            _.each(items, item => {
                const { title, link, isoDate, contentSnippet } = item;
                const slug = _(link)
                    .split('/')
                    .compact()
                    .last();
                const url = slug ? `https://www.ryanspoone.com/blog/${slug}` : link;
                posts.push(
                    `<li><a href="${url}"><b>${title}</b></a> on ${new Date(isoDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'America/Chicago'
                    })}<br /><i>${contentSnippet}</i></li>`
                );
            });
        } else {
            posts.push('<li>Not available</li>');
        }
        posts.push('</ul>');
        DATA.latestBlogPosts = posts.join('');
    } catch (error) {
        console.error('Failed to fetch blog posts:', error.message);
        DATA.latestBlogPosts = '<ul><li>Check out my latest posts at <a href="https://www.ryanspoone.com/blog">ryanspoone.com/blog</a></li></ul>';
    }
};

const generateReadMe = async () => {
    await fs.readFile('./main.mustache', (err, data) => {
        if (err) {
            throw err;
        }
        const output = Mustache.render(data.toString(), DATA);
        fs.writeFileSync('README.md', output);
    });
};

const action = async () => {
    await setBlogPosts();
    await generateReadMe();
};

action();
