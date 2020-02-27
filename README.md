<p align="center" >
    <img height="75" src="https://docuvision.io/images/logo.svg" alt="Docuvision">
    <br/>
    <img height="50" src="https://images.contentstack.io/v3/assets/bltefdd0b53724fa2ce/blt280217a63b82a734/5bbdaacf63ed239936a7dd56/elastic-logo.svg" alt="Elasticsearch"> &nbsp;&nbsp;
    <img height="50" src="https://www.docker.com/sites/default/files/d8/2019-07/vertical-logo-monochromatic.png" alt="Docker">
   
</p>

# Docuvision Studio

- Indexes documents using [Docuvision](https://docuvision.io/) and stores the results in elastic search.
- Explore the content using our web interface 

> NOTE: This is a alpha release and we would like to encourage you to send us any [feedback](https://github.com/isarbits/docuvision). 

## Prerequisites

 - [Docker](https://www.docker.com/)  

 - [docker-compose](https://docs.docker.com/compose/)  

 - [Docuvision API key](https://docuvision.io/index.html#contact-form)  

## Getting started

In a terminal, from the same folder as this README, copy the [`./docker/.env.example`](docker/.env.example) to `./docker/.env`:
```bash
cp ./docker/.env.example ./docker/.env
```

Edit the text file [`./docker/.env`](#FAQ) and replace `<put_your_api_key_here>` with your Docuvision api key.
```
COMPOSE_PROJECT_NAME=ds
COMPOSE_CONVERT_WINDOWS_PATHS=1
DOCUVISION_APIKEY=<put_your_api_key_here>
DATA_DIR=../index-root
```
So your `.env` would look something like this:
```
COMPOSE_PROJECT_NAME=ds
COMPOSE_CONVERT_WINDOWS_PATHS=1
DOCUVISION_APIKEY=7MQBbPTUin3xPVCGv*JdxKUf2X*Oo65yDyjBa&rEnri!MJ!ZYe6XRE9$cge5fY
DATA_DIR=../index-root
```

Finally, start docker:
```bash
cd ./docker && docker-compose up -d
```

Any files placed in the [`index-root`](index-root) folder will be indexed automagically (see [advanced usage](#changing-the-default-indexer-folder) for configuration options).  

That's it. The Docuvisionary client will start up (after a short wait) and you can visit http://localhost:8100 to see your search client

## Troubleshooting

 If you see the warning 
 ```
    WARNING: The DOCUVISION_APIKEY variable is not set. Defaulting to a blank string.
 ```
 it means you have not configured your Docuvision api key correctly. Make sure your api key is in the `docker/.env` file

## FAQ

 > Q: Where can I get a Docuvision API key?  
 > A: You can [sign up](https://docuvision.io/index.html#contact-form) at https://docuvision.io/

 > Q: Why can't I just add my API key to `.env.example` instead?  
 > A: By convention, `.env` files are normally ignored in git, so you won't risk accidentally showing the world your super secret key. Any public environment variables can safely go into `.env.example` to be copied over.

## Advanced

### Changing the default indexer folder

By default, the `DATA_DIR` variable in [`docker/.env`](docker/.env) is set to the [`index-root`](index-root) folder. You can change that to another location which will be watched for changes.

**\*\*WARNING\*\***: make sure the folder exists *before* starting the indexer, otherwise it will be created with the wrong permissions and will only run once on start instead of watching for changes.

Examples:

Using the full path:
```
DATA_DIR=/home/docuvison-lover/Media/cat-folder
```

Using a relative path (from the docker folder)
```
DATA_DIR=../../../Media/cat-folder
```

Windows paths also work
```
DATA_DIR=C:\Users\docuvison-lover\Media\cat-folder
```

### Editing images and modifying source modules

You can run images in development mode with:
```
cd ./docker && docker-compose -f docker-compose-dev.yml up -d
```

In addition to rebuilding the containers from the source files, this mounts the build files for the client ([public](client/public) and [src](client/src)) and indexer.

The client image will automatically rebuild when the source files change.

The indexer image will rebuild each time you build (`npm run build` or `npm run build -- -w`), but requires restarting the container (by design, as otherwise this would interrupt running processing).
