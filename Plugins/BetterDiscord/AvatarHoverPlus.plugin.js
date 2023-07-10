/**
 * @name AvatarHoverPlus
 * @version 0.1.5
 * @author t
 * @authorId 220369060452499456
 * @description Auto-bypasses most automated chat filters that bots use
 */

module.exports = (() => {
    const config = {
		info: {
			name: "AvatarHoverPlus",
			authors: [{
				name: "t",
				discord_id: "220369060452499456",
				email: "tosiq25@gmail.com"
			}],
			version: "0.1.5",
			description: "WARNING: TEMPORARY FIX. RELIES ON BDFDB. When hovering, resize the avatar. Use Ctrl / Ctrl+Shift. Now also shows emojis and stickers in the same way. Click while showing an enlarged image to copy the link."//,
			//github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/TheClapBestClapPluginClapEver.plugin.js",
			//github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/TheClapBestClapPluginClapEver.plugin.js"
		},
		changelog: [{
			title: "0.1.5",
			type: "added",
			items: [
				"Temporary fix for the copy function"
			]
		}],
		defaultConfig: [{
			id: "general",
			name: "general settings",
			type: "category",
			collapsible: true,
			shown: true,
			settings: [{
				id: "avatarBackgroundColor",
				name: "avatarBackgroundColor:",
				type: "textbox",
				value: "rgba(18,18,18,0.7)"
			},
            {
				id: "avatarBorderRadius",
				name: "avatarBorderRadius:",
				type: "textbox",
				value: "4px"
			},{
				id: "avatarBorderSize",
				name: "avatarBorderSize:",
				type: "textbox",
				value: "2px"
			},{
				id: "avatarBorderColor",
				name: "avatarBorderColor:",
				type: "textbox",
				value: "#651717"
			}]
		}]
    };

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
                });
            }
		}

		start() { }
		stop() { }
	} : (([Plugin, Api]) => {

		const plugin = (Plugin, Api) =>
		{
			const { DiscordModules, Patcher } = Api;
            var css, curKey, settings, handleFocusLoss, handleKeyDown, handleKeyUp, handleMouseDown, handleMouseUp, handleMouseOverOut, hoverCard, lastTarget, qualifier, updateHoverCard, updateQualifier;

			class AvatarHoverPlus extends Plugin
			{
				constructor()
				{
					super();
				}

                getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}

				onLoad() {}
	
				async onStart() {
                    css = `#AvatarHoverPlus {
  background-size: cover;
  border-style: solid;
  display: block;
  pointer-events: none;
  position: fixed;
  z-index: 99999;
}
#settings_AvatarHoverPlus {
  color: #87909C;
}`;

                    updateQualifier();
                    BdApi.injectCSS("css-AvatarHoverPlus", css);
                    const hoverCard = document.createElement("div");
                    hoverCard.id  = "AvatarHoverPlus";
                    document.body.append(hoverCard);

                    settings = {
                        avatarBackgroundColor: this.settings.general.avatarBackgroundColor,
                        avatarBorderColor: this.settings.general.avatarBorderColor,
                        avatarBorderRadius: this.settings.general.avatarBorderRadius,
                        avatarBorderSize: this.settings.general.avatarBorderSize
                    };

                    document.addEventListener("keydown", handleKeyDown, true);
                    document.addEventListener("keyup", handleKeyUp, true);
                    document.addEventListener("mousedown", handleMouseDown, true);
                    document.addEventListener("mouseup", handleMouseUp, true);
                    document.addEventListener("mouseover", handleMouseOverOut, true);
                    document.addEventListener("mouseout", handleMouseOverOut, true);
                    return window.addEventListener("blur", handleFocusLoss, true);
				}

                onStop() {
					document.removeEventListener("keydown", handleKeyDown, true);
                    document.removeEventListener("keyup", handleKeyUp, true);
                    document.removeEventListener("mousedown", handleMouseDown, true);
                    document.removeEventListener("mouseup", handleMouseUp, true);
                    document.removeEventListener("mouseover", handleMouseOverOut, true);
                    document.removeEventListener("mouseout", handleMouseOverOut, true);
                    window.removeEventListener("blur", handleFocusLoss, true);
                    try {hoverCard.remove()} catch {console.log("error: hovercard (null) cannot be removed")};
                    BdApi.clearCSS("css-AvatarHoverPlus");

                    console.log("shutting down AvatarHoverPlus...");
					const tryUnpatch = fn => {
						if (typeof fn !== 'function') return;
						try {
							// things can bug out, best to reload tbh, should maybe warn the user?
							fn();
						} catch (e) {
							ZeresPluginLibrary.Logger.stacktrace(this.getName(), 'Error unpatching', e);
						}
					};
					if (Array.isArray(this.unpatches)) for (let unpatch of this.unpatches) tryUnpatch(unpatch);
    				ZeresPluginLibrary.Patcher.unpatchAll(this.getName());
					try {
						this.Patcher.unpatchAll();
					} catch (e) {console.log("failure shutting down AvatarHoverPlus");}
                    return;
				}
			};
            //####################################################################################################################################################################################################################################################################################################################
            // weird structuring here

            hoverCard = null;
            qualifier = null;
            MouseDown = 0;

            updateQualifier = function () {
                return qualifier = [".wrapper-3kah-n, .icon-1zKOXL", // <- guilds
                ".layout-1qmrhw .avatar-6qzftW", // <- voip, DM channels
                ".userInfo-2zN2z8 .avatar-3W3CeO, .avatar-2MSPKk", // <- friends list
                ".contents-2MsGLg .avatar-2e8lTP, .embedAuthorIcon--1zR3L, .repliedMessage-3Z6XBG img", // <- messages, embeds
                ".member-3-YXUe .avatar-3uk_u9", // <- channel users
                ".callAvatarWrapper-3Ax_xH", // <- DM call
                ".header-S26rhB .avatar-3QF_VA, .avatarWrapper-3y0KZ1, .userAvatar-3Hwf1F, .wrapper-3Un6-K, .miniAvatar-dnzs_w, .baseAvatar-1IkcZI", // <- modals, userpopout
                ".emojiContainer-2XKwXX .emoji, .roleIcon-zWuatl, .repliedTextPreview-1bvxun", // <- emojis, name icons
                ".reaction-3vwAF2 .emoji, .emoji-1kNQp2", // <- reactions
                ".emojiItemMedium-2stgkv img, .emojiSpriteImage-3ykvhZ", // <- emoji menu
                ".stickerAsset-4c7Oqy", // <- stickers
                ".roleIcon-29epUq, .roleIcon-zWuatl" // <- role icons
                ].filter(function (s) {
                    return s != null;
                }).join(", ");
            };

            handleKeyDown = function ({
                key
            }) {
                curKey = key;
                if (key !== "Control" && key !== "Shift") {
                    return;
                }
                return updateHoverCard();
            };

            handleKeyUp = function () {
                curKey = null;
                return updateHoverCard();
            };

            handleMouseDown = async function () {
                mouseDown = 1;
                updateHoverCard();
                mouseDown = 0;
                await new Promise(r => setTimeout(r, 5000));
            };

            handleMouseUp = function () {
                mouseDown = 0;
                return updateHoverCard();
            };

            handleFocusLoss = function () {
                return updateHoverCard();
            };

            handleMouseOverOut = function ({
                type,
                target
            }) {
                if (target.matches(".emojiItemMedium-2stgkv")) {
                    target = target.children[0];
                }
            
                if (!(target.matches(qualifier) || (target = target.closest(qualifier)))) {
                    return;
                }
                
                return updateHoverCard("mouseover" === type && target);
            };

            lastTarget = null;

            updateHoverCard = async function (target = lastTarget) {
                var boundsTarget, boundsWindow, imageUrl, isLarge, isShown, left, ref, size, top;
                const fullSize = 256;
                lastTarget = target;
                isShown = (curKey == 'Control');
                isLarge = true;

                if (!document.getElementById("AvatarHoverPlus")) {
                    const hoverCardtemp = document.createElement("div");
                    hoverCardtemp.id  = "AvatarHoverPlus";
                    document.body.append(hoverCardtemp);
                }
                hoverCard = document.getElementById("AvatarHoverPlus");

                if (!(isShown && target)) {
                    return hoverCard.remove();
                }
            
                size = isLarge && fullSize || Math.ceil(fullSize/2);
                boundsTarget = target.getBoundingClientRect();
                boundsWindow = {
                    width: window.innerWidth,
                    height: window.innerHeight
                };
                left = Math.max(0, boundsTarget.left + (boundsTarget.width - size) / 2);
            
                if (left + size > boundsWindow.width) {
                    left = boundsWindow.width - size;
                }

                top = size > boundsWindow.height ? (boundsWindow.height - size) / 2 : boundsTarget.bottom + size > boundsWindow.height ? boundsTarget.top - size : boundsTarget.bottom;
            
                if ("none" === (imageUrl = (((ref = target.querySelector("img")) != null ? ref.src : void 0) || target.src || getComputedStyle(target).backgroundImage.match(/^url\((["']?)(.+)\1\)$/)[2]).replace(/\?size=\d{2,4}\)?$/, `?size=${fullSize*2}`))) {
                    return hoverCard.remove();
                }
            
                imageUrl = imageUrl.replace(/\?size=\d*&/, `?size=${fullSize*2}}`);
            
                //BdApi.showToast(`test ${target} ${imageUrl}`);
                // ###################################################################################################

                if (mouseDown == 1) {
                    try {
                        ZeresPluginLibrary.DiscordModules.ElectronModule.copy(imageUrl);
                        BdApi.showToast(`Image Copied!`);
                    } catch {
                        BdApi.showToast(`ERROR: Failed to Copy Image Link`);
                    }
            
                    mouseDown == 0;
                }
            
                Object.assign(hoverCard.style, {
                    backgroundColor: settings.avatarBackgroundColor,
                    backgroundImage: `url(${imageUrl})`,
                    borderColor: settings.avatarBorderColor,
                    borderRadius: settings.avatarBorderRadius,
                    borderWidth: settings.avatarBorderSize,
                    width: `${size}px`,
                    height: `${size}px`,
                    top: `${top}px`,
                    left: `${left}px`,
                    backgroundSize: `contain`,
                    backgroundRepeat: `no-repeat`,
                    backgroundPosition: `center`
                });

                return document.body.appendChild(hoverCard);
            }

            return AvatarHoverPlus;
		};

        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
