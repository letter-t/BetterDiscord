/**
 * @name CustomPing
 * @version 0.0.1, 0.2.0
 * @authors Metalloriff, t
 * @authorIds 264163473179672576, 220369060452499456
 * @description A modified version of Metalloriff's "bruh" plugin, intended to be customized.
 */

// If you're reading this, there's a pretty good chance you want to change the terms searched or the sounds played, or something else.
// Here's a list of where to go to change most things you'd want to change:

// To change the custom term (which is anything by default), go to line 199 and change the regexp.
// To change the sound played, go to line 215. Just change the link.
//     Note: the link must lead directly to an audio file. The link should start downloading the file upon opening it, or show nothing but the audio clip in your browser.
// To change the messages that come up, go to lines 216 and 217.
// To add an exception for yourself in your own private server, go to line 211.
// There's also some settings for this in the plugin menu. Enjoy!

module.exports = (() => {
	const config = {
		info: {
			name: "CustomPing",
			authors: [{
				name: "Metalloriff",
				discord_id: "264163473179672576",
				github_username: "metalloriff",
				twitter_username: "Metalloriff",
                invite: "yNqzuJa",
                authorLink: "https://github.com/Metalloriff",
                donate: "https://www.paypal.me/israelboone",
                website: "https://metalloriff.github.io/toms-discord-stuff/",
                source: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/Bruh.plugin.js"
			}, {
				name: "t",
				discord_id: "220369060452499456",
				email: "tosiq25@gmail.com"
			}],
			version: "0.0.1, 0.2.0",
			description: "The \"bruh\" plugin, but for custom search terms.",
			//github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/Bruh.plugin.js",
			//github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/Bruh.plugin.js"
		},
		defaultConfig: [{
			id: "general",
			name: "general settings",
			type: "category",
			collapsible: true,
			shown: true,
			settings: [{
				id: "volume",
				name: "Volume",
				//note: "Controls the volume",
				type: "slider",
				value: 100,
				min: 0,
				max: 100,
				renderValue: v => Math.round(v) + "%"
			}, {
				id: "notifs",
				name: "XenoLib Notifications",
				//note: "Enables notifications to appear when the sound effect triggers",
				type: "switch",
				value: true
			}, {
				id: "notifTimeout",
				name: "Notification Timeout Delay (ms)",
				//note: "Time until notification disappears, in milliseconds (0 ms = no timeout)",
				type: "slider",
				value: 10000,
				min: 0,
				max: 60000,
				renderValue: v => Math.round(v) + "ms"
			}, {
				id: "toasts",
				name: "Toasts",
				//note: "Enables toasts (small notifications) to appear when the sound effect triggers.",
				type: "switch",
				value: true
			}, {
				id: "blusers",
				name: "User IDs for Blacklisted People",
				note: "Put User IDs here to add them to the blacklist. They'll be unable to trigger any alerts. Separate with commas and/or spaces.",
				type: "textbox",
				value: "UserID1, UserID2, UserID3, etc"
			}, {
				id: "blchannels",
				name: "Channel IDs for Blacklisted Channels",
				//note: "Put Channel IDs here to add them to the blacklist. They'll no longer trigger any alerts. Separate with commas and/or spaces.",
				type: "textbox",
				value: "ChannelID1, ChannelID2, ChannelID2, etc"
			}, {
				id: "blservers",
				name: "Server IDs for Blacklisted Servers",
				//note: "Put Server IDs here to add them to the blacklist. They'll no longer trigger any alerts. Separate with commas and/or spaces.",
				type: "textbox",
				value: "ServerID1, ServerID2, ServerID3, etc"
			}, {
				id: "layers",
				name: "Layered Sounds",
				//note: "Enables sounds to layer on top of eachother, instead of stopping the current sound when a new one is played.",
				type: "switch",
				value: true
			}]
		}]
	}

	return (!global.ZeresPluginLibrary) ? class {
		constructor() { this._config = config; }
		getName = () => config.info.name;
		getAuthor = () => config.info.description;
		getVersion = () => config.info.version;
		load() {
			if (!global.ZeresPluginLibrary) {
				BdApi.showConfirmationModal("Library Missing", `The library plugin ZeresPluginLibrary needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onConfirm: () => {
						require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (err, res, body) => {
							if (err) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
							await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
						});
					}
				})
			}
		}
		start() { }
		stop() { }
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => { try {
			const {
				DiscordModules, WebpackModules
			} = Api;
			const audio = new Audio();

			return class CustomPing extends Plugin {
				constructor() {
					super();
				}

                getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}

				onLoad() {}
	
				onStart() {
					DiscordModules.Dispatcher.subscribe("MESSAGE_CREATE", (_) => this.onDispatchEvent(_));

					audio.volume = this.settings.general.volume/100;
					this.lastReply = 0;
				}

				onDispatchEvent(dispatch) {
					if (dispatch.type == 'MESSAGE_CREATE' && dispatch.message && (dispatch.message.content.length || (dispatch.attachments && dispatch.attachments.length) || (dispatch.embeds && dispatch.embeds.length)) && dispatch.message.state != 'SENDING' && !dispatch.optimistic && (dispatch.message.type === 0 || dispatch.message.type === 19 || dispatch.message.type === 20)) {
						this.messageEvent(dispatch.message);
						return;
					}
					return;
				}

				getLiteralName(guildId, channelId, messageId, useTags = false) {
					const guild = WebpackModules.getByProps('getGuild', 'getGuildCount').getGuild(guildId);
					const channel = WebpackModules.getByProps('getChannel', 'getDMFromUserId').getChannel(channelId);
					if (guildId) {
						const channelName = (channel ? channel.name : 'unknown-channel');
						const guildName = (guild ? guild.name : 'unknown-server');
						if (useTags && channel) return `${guildName}, <#${channelId}> https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
						return `${guildName}, #${channelName}`;
					}
					else {
						return `a DM`;
					}
				}

				jumpToMessage(guildId, channelId, messageId) {
					DiscordModules.NavigationUtils.transitionTo(`/channels/${guildId || '@me'}/${channelId}${messageId ? '/' + messageId : ''}`);
				}
				
				// This part is the part that does the thing, you probably want to look here
				async messageEvent(m) {
					var a = this.settings.general;
					if (a.onlyCur && (m.channel_id != DiscordModules.SelectedChannelStore.getChannelId())) return;
					
					const channelId = m.channel_id,
					guildId = m.guild_id,
					nickname = m.member ? m.member.nick : "null",
					content = ' ' + m.content.toLowerCase().replace(/\n/g, " ") + ' ',  // <- this processes messages into something more usable
					blusers = a.blusers.split(/[\s,]+/),
					blchannels = a.blchannels.split(/[\s,]+/),
					blservers = a.blservers.split(/[\s,]+/);

					// v this statement stops repeat triggers from the same message, which does happen
					if (!guildId && WebpackModules.getByProps('getChannel', 'getDMFromUserId').getChannel(m.channel_id).guild_id != null) return;
					// v ignores blacklisted users, channels, and servers
					if (blusers.includes(m.author.id.toString()) || blchannels.includes(channelId.toString()) || blservers.includes(guildId.toString())) return;

					const customTerms = /.*/g;
					// ^ this is the part that defines what the custom term is
                    // it's set to work for anything by default
					// if you want to change anything here, this is probably what you're looking for
                    // here's an example: 
                    //      const customTerms = /the phrase you want this to trigger for/g;
					// if you want to see a guide on regex formatting, check out this link: 
					// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet
					// https://regex101.com/
					// if you're still confused about how this part works, say "t" and i'll try to help

					// v for checking if you're in a testing server
					if (((m.author.id == 'your user id here') && (guildId != 'your private server id here'))) return;
                    if (!customTerms.test(content)) return;

					this.playSound("https://www.myinstants.com/media/sounds/hog-rider.mp3");// HOG RIDAAAAAA
					(!!a.toasts) ? BdApi.showToast("Playing \"Hog Rider\" sound effect") : null;
					(!!a.notifs) ? BdApi.showNotice(`@${m.author.username} (${nickname}) said something in ${this.getLiteralName(guildId, channelId, m.id, false)}`) : null;
					//XenoLib.Notifications.warning(
					//	`<@!${message.author.id}> (${nickname}) said "t" in ${this.getLiteralName(guildId, channelId, message.id, true)}`, { timeout: 0, onClick: () => this.jumpToMessage(guildId, channelId, message.id) });

                    return;
				}
				
				playSound(link) {
					if (this.settings.general.layers) {
						const audio = new Audio();
						audio.volume = this.settings.general.volume/100;
						audio.src = link;
						audio.play();
					}
					else {
						audio.src = link;
						audio.play();
					}
				}
				
				onStop() {
					// was sick and tired of the dispatcher.unsubscribe() function not working at all ever, so i just made my own unsubscribe method
					try {
						var subs = new Set();
						subs = DiscordModules.Dispatcher._subscriptions.MESSAGE_CREATE;
						for (const item of subs) {
							if (item.toString().includes('this.onDispatchEvent(_)')) {
								subs.delete(item);
							}
						}
						DiscordModules.Dispatcher._subscriptions.MESSAGE_CREATE = subs;
					} catch (e) {console.log(e)}
				}
			}
		} catch (e) { console.error(e); }}

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
