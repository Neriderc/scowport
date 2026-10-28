<h1 align="center">
    Scowport
</h1>

<h4 align="center">A web app for Zusam</h4>

## What is Scowport ?

Scowport is a web app for [Zusam](https://github.com/zusam/zusam). It started as a hard fork of Zusam's web app, and over time will build into it's own thing. The primary aim is for my non-technical family to be able to use Zusam as a platform for sharing photos and videos of the fammily without needing to resort to facebook, but with a familiar interface. However, alongside this aim is a desire to also support any new Zusam features that may be added after the fork.


## Features

- Links preview and embedded youtube, vimeo, imgur, soundcloud, twitch, bandcamp...
- Video and image upload
- Photo albums
- Completely responsive and mobile friendly
- Full Zusam feature support

## Differences from the Zusam web app

- Upload many photos and videos all at once
- Two layered replies (similar to facebook), instead of Zusam's one layer with a button to child replies on another page.
- Gallery mode is used when there is more than one file attached, compared to 4 or more files in Zusam
- Dragging files to reorder will insert the file in the dropped spot, instead of swapping the position of the files
- Group pages have a header with buttons to leave or invite others, and a button to go to the group's settings page.
- Invite flow completely redone, you can invite users to multiple groups and they can review groups before joining (except the first group when signing up, due to Zusam requirement to always be joining a group on signup). Integrates with Shlink to provide short invite links.
- Adjustments to signup form to confirm email and enter your preferred name
- Help icon on navigation bar starts an interactive tutorial

## Install

Scowport is intended to be run alongside Zusam, as part of a Docker Compose stack. It also supports integration with Shlink for shorter invite URLs.

To set up Scowport with all functions, first, copy the below example compose.yaml file. If you are already running Zusam, add the other services to your compose file, you should not need to adjust your Zusam service unless it is not called "zusam". Renaming the service is the easiest option, but you can adjust the Scowport environment variable ZUSAM_API_URL and the nginx config to keep the existing name (requires mapping the nginx config file in a volume to overwrite the one built with the image).

```
compose coming soon! See dev/compose.yaml in the meantime, but understand it's not designed for production use.
```

To prevent docker mounting issues, we need to create the Shlink servers file first:

```
mkdir shlink && touch servers.json
```

Start the stack:

`docker compose up -d`

Now generate the Shlink API key:

`docker exec -it shlink shlink api-key:generate`

Copy the API key into a new file called `.env` created in the same directory as the compose file as below. If this file already exists, add the value to the existing file. Also add a password for the Shlink database to use.

```
SHLINK_API_KEY=[API key here]
HLINK_DB_PASSWORD=[add randomly generated password here]
```

Recreate scowport to load the API key:
`docker compose up -d scowport`

You should now be able to access Scowport. 

## Webapp compatibility

We do our best to support any common browsers such as Firefox, Safari, and Chromium (Chrome, Edge, Opera, etc). Please open an issue if something isn't working right.

## Contributing

Scowport is free and open-source software licensed
under [AGPLv3](https://www.gnu.org/licenses/agpl.html).  
You can open issues for bugs you've found or features you think are missing, or submit pull requests to this repository. See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information.

## Translations
