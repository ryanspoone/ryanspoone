/**
 * @copyright Copyright (c) 2020 Ryan Spoone
 */

'use strict';

require('dotenv').config();
const _ = require('lodash');
const Mustache = require('mustache');
const fs = require('fs').promises;
const Parser = require('rss-parser');

// Constants
const TIMEZONE = 'America/Chicago';
const RSS_FEED_URL =
    process.env.RSS_FEED_URL || 'https://www.ryanspoone.com/admin/6e77be03b4b76fc45615cb2967af11/rss/';
const TEMPLATE_FILE = './main.mustache';
const OUTPUT_FILE = 'README.md';

const DATE_OPTIONS = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: TIMEZONE,
};

const BLOG_DATE_OPTIONS = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: TIMEZONE,
};

const DATA = {
    refreshDate: new Date().toLocaleDateString('en-US', DATE_OPTIONS),
    latestBlogPosts: '<ul><li>Not available</li></ul>',
};

/**
 * Fetches and parses blog posts from RSS feed
 * Updates DATA.latestBlogPosts with formatted HTML list
 * @returns {Promise<void>} Resolves when posts are fetched and stored
 */
const setBlogPosts = async () => {
    try {
        const parser = new Parser();
        const { items } = await parser.parseURL(RSS_FEED_URL);

        const posts = ['<ul>'];

        if (!_.isEmpty(items)) {
            _.each((item) => {
                const { title, link, isoDate, contentSnippet } = item;
                const slug = _(link).split('/').compact().last();
                const url = slug ? `https://www.ryanspoone.com/blog/${slug}` : link;
                const formattedDate = new Date(isoDate).toLocaleDateString('en-US', BLOG_DATE_OPTIONS);

                posts.push(`
                    <li>
                        <a href="${url}"><b>${title}</b></a> on ${formattedDate}
                        <br /><i>${contentSnippet}</i>
                    </li>
                `);
            }, items);
        } else {
            posts.push('<li>Not available</li>');
        }

        posts.push('</ul>');
        DATA.latestBlogPosts = posts.join('');
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch blog posts:', error.message);
        DATA.latestBlogPosts =
            '<ul><li>Check out my latest posts at <a href="https://www.ryanspoone.com/blog">ryanspoone.com/blog</a></li></ul>';
    }
};

/**
 * Generates README.md from Mustache template with current DATA
 * @returns {Promise<void>} Resolves when README is written
 * @throws {Error} When template file cannot be read or README cannot be written
 */
const generateReadMe = async () => {
    const data = await fs.readFile(TEMPLATE_FILE, 'utf8');
    const output = Mustache.render(data, DATA);
    await fs.writeFile(OUTPUT_FILE, output);
};

/**
 * Main action function that orchestrates the README generation
 * Fetches blog posts and generates the README file
 * @returns {Promise<void>} Resolves when all operations complete
 */
const action = async () => {
    try {
        await setBlogPosts();
        await generateReadMe();
        // eslint-disable-next-line no-console
        console.log('README generated successfully');
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to generate README:', error);
        process.exit(1);
    }
};

action();
