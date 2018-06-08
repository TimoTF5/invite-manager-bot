import {
	Command,
	CommandDecorators,
	Logger,
	logger,
	Message,
	Middleware
} from '@yamdbf/core';
import { TextChannel } from 'discord.js';

import { IMClient } from '../client';
import { CommandGroup, createEmbed, sendEmbed } from '../utils/util';

const { resolve, expect } = Middleware;
const { using } = CommandDecorators;

const config = require('../../config.json');

export default class extends Command<IMClient> {
	@logger('Command') private readonly _logger: Logger;

	public constructor() {
		super({
			name: 'feedback',
			aliases: ['suggestion', 'suggestions'],
			desc: 'Give feedback about the bot to the developers',
			usage: '<prefix>feedback <message>',
			info:
				'`message`:\n' +
				'The message you would like to submit as feedback.\n\n',
			group: CommandGroup.Other,
			guildOnly: true
		});
	}

	@using(resolve('...feedback: String'))
	@using(expect('...feedback: String'))
	public async action(message: Message, feedback: [string]): Promise<any> {
		this._logger.log(
			`${message.guild.name} (${message.author.username}): ${message.content}`
		);

		// Feature: Add history of commands the user entered to see possible errors and what he tried to do

		if (config.feedbackChannel) {
			// tslint:disable-next-line
			let channel = <TextChannel>(
				message.client.channels.get(config.feedbackChannel)
			);

			const embedFeedback = createEmbed(this.client);
			embedFeedback.setAuthor(
				`${message.author.username}#${message.author.discriminator}`,
				message.author.avatarURL()
			);
			embedFeedback.addField(
				'Guild',
				`${message.guild.id} - ${message.guild.name}`
			);
			embedFeedback.addField('Message', `${feedback}`);
			embedFeedback.addField('User ID', message.author.id);

			channel.send({ embed: embedFeedback }).then(() => {
				const embed = createEmbed(this.client);
				embed.setDescription(
					`Thank you for your feedback! ` +
						`If you need personal assistance please join our support discord server.`
				);

				let linksArray = [];
				if (config.botSupport) {
					linksArray.push(`[Support Discord](${config.botSupport})`);
				}
				if (config.botAdd) {
					linksArray.push(`[Invite this bot to your server](${config.botAdd})`);
				}
				if (config.botWebsite) {
					linksArray.push(`[Website](${config.botWebsite})`);
				}
				if (config.botPatreon) {
					linksArray.push(`[Patreon](${config.botPatreon})`);
				}

				embed.addField(`Links`, linksArray.join(` | `));

				sendEmbed(message.channel, embed, message.author);
			});
		}
	}
}
