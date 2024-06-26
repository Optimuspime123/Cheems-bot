const { Message, MessageMedia } = require('whatsapp-web.js');
const got = require('got');
require('dotenv').config()


class Module {

    /** @type {string} */
	name = 'Meme'

	/** @type {string} */
	description = 'Get random memes from reddit.'

	/** @type {JSON} */
	commands = {
		'meme': `${process.env.PREFIX}meme [subreddit]`,
	};

    /**
     * @param {Client} client
     * @param {Message} msg
     */

    async operate(client, msg) {
        let subreddit = '';
        let meme_api = "https://meme-api.com/gimme/meme/50";

        const regex = new RegExp(`${process.env.PREFIX}meme (.+)`)
        const regxmatch = msg.body.match(regex);
        if (regxmatch) {
            subreddit = regxmatch[1].split(' ')[0];
            meme_api = `https://meme-api.com/gimme/${subreddit}/50`
        }

        // use https://github.com/D3vd/Meme_Api for fetching memes
        const res = await got(meme_api);

        if (res.statusCode < 200 || res.statusCode > 299) {
            throw `failed meme-api request: ${res.statusCode}`;
        }

        let body = JSON.parse(res.body);

        if (body.code === 404) {
            msg.reply(
                `subreddit ${subreddit} doesn't exists !`,
                msg.from
            );
            return;
        }

        body = body['memes'][Math.floor(Math.random()*body['memes'].length)]

        // filter out spoilers and nsfw, also Client.sendMessage doesn't support gif files
        if (body.url.slice(-3) === 'gif') {
            return "retry";
        }

        const media = await MessageMedia.fromUrl(body.url, {unsafeMime: true});
        await client.sendMessage(
            msg.from,
            media,
            { caption: body.title }
        );
        return body.url;
    };

}

module.exports = Module