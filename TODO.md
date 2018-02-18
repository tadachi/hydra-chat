# List of TODOS

### High Priority
* Move client-id out of store.js into it's own file that is not commited into git

* Migrate to new Twitch API during/after 2018

* Register moderator commands so spam can be deleted, etc.

* Support subscriber emotes

* Figure how to proceed after Chrome distrusts Symantec certificates completely

* ~~Fix mobile/desktop dimensions~~ (**On-Going**)

* Save the access token and permissions in LocalStorage

* Remove queryString from the URL so to not alarm the User

### Low Priority
* ~~OnHover of a message's emote, show the emote large, its origin (twitch, BTTV, FFZ) and its code (PogChamp)~~ (**Completed**)

* Color picker
    * Show on ChannelManager channel cards onClick event

* Show all message as black command
    * Place in ChatMenu modal

* Emote picker that shows only emotes used in the past as to not overload the user
    * Place within Chat's chat textarea on far right corner just like in Twitch's chat
  
* Add autojoin to recently joined channels
    * This list of recently joined channels are acquired by joining a channel first. They are not added immediately
    * These channels are stored in LocalStorage

* Catch all app stopping errors 

* Register urls in chat so you can click and visit them

* Change favicon to an inactive version when there are no channels joined

* Click on user avatar to go to their twitch profile

* Show/Remove Timestamps