/**
 * @name UndraggableIcons
 * @author t
 * @authorId 220369060452499456
 * @description Makes server icons undraggable
 */

 module.exports = (() => {
	const config =
	{
		info: {
			name: "Undraggable Icons",
			authors: [{
				name: "t",
				discord_id: "220369060452499456",
				email: "tosiq25@gmail.com"
			}],
			version: "0.0.4",
			description: "Makes server icons undraggable",
		}
	};

    return (!global.ZeresPluginLibrary) ? class {
		constructor() { this._config = config; }

		getName = () => config.info.name;
		getAuthor = () => config.info.description;
		getVersion = () => config.info.version;

		load() {
			if (!global.ZeresPluginLibrary) {
				j = () => BdApi.alert(f, BdApi.React.createElement("span", {
					style: {
						color: "white"
					}
				}, 
				!global.ZeresPluginLibrary ? BdApi.React.createElement("div", {}, BdApi.React.createElement("a", {
					href: "https://betterdiscord.net/ghdl?id=2252",
					target: "_blank"
				}, "Click here to download ZeresPluginLibrary")) : null));
			}
		}

		start() { }
		stop() { }
	} : (([Plugin, Api]) => {

        const plugin = (Plugin) => { try {

            return class test extends Plugin {
                constructor() {
                    super();
                }

                onLoad () {
                }

                handler = (e) => {
                    e.preventDefault()
                }

                handleMouseDown = async ({target}) => {
					// .childWrapper-1j_1ub <- Discord Icon Background (not the icon itself)
					// .wrapper-3kah-n <- Server Icons
					// .closedFolderIconWrapper-3tRb2d <- Closed Folder
					// .expandedFolderIconWrapper-3RwQpD <- Open Folder Background
					// .expandedFolderIconWrapper-3RwQpD svg path <- Open Folder Icon
                    if (target.matches(".wrapper-3kah-n")) {
						//let values = Object.values(target.__reactProps$);
						//let keys = Object.getOwnPropertyNames(target.__reactProps$);
						//console.log(`SERVER ICON \n\n${keys} \n\n${values} \n\n${target.BaseURI}`);
						//BdApi.showToast(`${target.__reactProps$.data-list-item-id}`);
						//ZeresPluginLibrary.DiscordModules.NavigationUtils.transitionTo(`${target.getAttribute("href")}`);
                    }
                    return;
                };
	
			    onStart() {
                    document.addEventListener('mousedown', this.handleMouseDown, true);
                    document.addEventListener('dragstart', this.handler, true);
                    document.addEventListener('drop', this.handler, true);
                }

                onStop() {
                    document.removeEventListener('mousedown', this.handleMouseDown, true);
                    document.removeEventListener('dragstart', this.handler, true);
                    document.removeEventListener('drop', this.handler, true);
                }
            }
        } catch (e) { console.error(e); }};
    
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();