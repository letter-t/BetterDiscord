/**
 * @name AutoBypass
 * @version 0.0.7
 * @author t
 * @authorId 220369060452499456
 * @description Auto-bypasses most automated chat filters that bots use
 */

module.exports = (() => {
    const config = {
		info: {
			name: "AutoBypass",
			authors: [{
				name: "t",
				discord_id: "220369060452499456",
				email: "tosiq25@gmail.com"
			}],
			version: "0.0.7",
			description: "Auto-bypasses most chat filters. This was partially made with code from Metalloriff's \"TheClapBestClapPluginClapEver\"."//,
			//github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/TheClapBestClapPluginClapEver.plugin.js",
			//github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/TheClapBestClapPluginClapEver.plugin.js"
		},
		changelog: [{
			title: "0.0.7",
			type: "added",
			items: [
				"Rewrote the code a bunch. Actually looks good now"
			]
		}],
		defaultConfig: [{
			id: "general",
			name: "general settings",
			type: "category",
			collapsible: true,
			shown: true,
			settings: [{
				id: "badwords",
				name: "Phrases to auto-bypass",
				note: "Put phrases here to add them to the bypass list. Separate each term with a comma. Should look like this: \nheck,darn,crap",
				type: "textbox",
				value: ""
			}, {
				id: "filler",
				name: "Invisible filler character between letters",
				note: "Put a filler character here, or leave it blank for nothing. Make sure nothing is already in here before changing it. \nKnown zero-width characters: \\u200b \"\u200b\", \\u17b5 \"\u17b5\"(visible on mobile)",
				type: "textbox",
				value: "​"
			}, {
				id: "changeLetters",
				name: "Change some of the letters to characters that look the same",
				//note: "When enabled, some letters in bypassed terms will be replaced with characters that look exactly the same.",
				type: "switch",
				value: true
			}, {
				id: "urlfix",
				name: "Disables the plugin for URLs",
				type: "switch",
				value: true
			}]
		}]
    };

    return (!global.ZeresPluginLibrary) ? class {
		constructor() { this._config = config; }

		getName = () => config.info.name;
		getAuthor = () => config.info.description;
		getVersion = () => config.info.version;

		load() {
			BdApi.showConfirmationModal("Library Missing", `The library plugin ZeresPluginLibrary needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (err, res, body) => {
						if (err) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					});
				}
			});
		}

		start() { }
		stop() { }
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {
			const { DiscordModules, Patcher } = Api;
			return class AutoBypass extends Plugin {
				constructor() {
					super();
				}

				getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}

				onLoad() {}
	
				onStart() {
					Patcher.after(DiscordModules.MessageActions, "sendMessage", (_, [, message]) => {
						var a = this.settings.general,
						b = " " + message.content + " ";
						const badwords = a.badwords.toLowerCase().split(","),
						filler = a.filler,
						count = (b.match(RegExp(badwords.join("|"), "gi")) || []).length;
						if (count == 0) return;
						if (b.match(/https:\/\//g) && a.urlfix) return;
						for (let i = 0; i < badwords.length; i++) {
							const len = badwords[i].length,
							count2 = (b.match(RegExp(badwords[i], "gi")) || []).length;
							for (let j = 0; j < count2; j++) {
								const idx = b.toLowerCase().indexOf(badwords[i]),
								c = b.slice(idx, idx+len),
								d = !!a.changeLetters ? this.useSimilar(c) : c,
								// the number here can be changed to allow for more filler characters v
								e = d.split("").join('-').replace(/-/gi, x => filler.repeat(Math.ceil(3*Math.random())));
								b = b.replace(RegExp(badwords[i], "i"), e);
							}
						}
						BdApi.showToast(`Found and fixed ${count} censored words`);
						message.content = b.trim();
                    });
				}

				useSimilar(c) {
					//abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
					//аbсdеfgһіјkӏmnорqrѕtuvwхуzАВСDЕFGНІJΚLМΝОРQRЅТUVWХΥΖ
					// if you want to add or remove a letter for it to replace, add/remove a normal letter to alphabet and the lookalike to alphaspoof
					const alphabet = 'acehijopsxyABCEHIKMNOPSTXYZ',
					    alphaspoof = 'асеһіјорѕхуАВСЕНІΚМΝОРЅТХΥΖ';
					let idx;
					// v i didn't write this shit dude, this is black fucking magic holy shit one line
					return c.split('').map(t => ((idx = alphabet.indexOf(t)) === -1) ? t : alphaspoof[idx]).join('')
				}
	
				onStop() {
					Patcher.unpatchAll();
				}
			}
		};

        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
