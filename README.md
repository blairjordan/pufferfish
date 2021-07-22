Pufferfish allows you to define your cloud network architecture using [handlebars templates](https://handlebarsjs.com/), and converts these to Graphviz diagrams.

Diagrams can be output as .png (or any other format supported by Graphviz).

## Example

Here's an example `.png` diagram generated from [templates/main.hbs](templates/main.hbs).

![](screenshots/1.png?raw=true)

## Quickstart - How to update diagrams

**Build pufferfish** (See instructions below).

Edit diagrams under the `templates` directory.

> I recommend storing templates in a seperate repository. This will allow you to source control your network architecture diagrams. You can specify a templates directory using the --template directive.

Make a directory for your output:

`mkdir -p output`

Run pufferfish to build all the templates in png format:
```
docker run \
	--name pufferfish \
	--rm \
	-v $(pwd)/templates:/usr/src/app/templates \
	-v $(pwd)/output:/usr/src/app/output \
	-e PUFFERFISH_OUTPUT_FORMAT=png \
	pufferfish:latest
```

See [https://graphviz.org/doc/info/output.html](https://graphviz.org/doc/info/output.html "https://graphviz.org/doc/info/output.html") for a list of available `PUFFERFISH_OUTPUT_FORMAT` output formats.

Your diagrams will appear in `/output`

Review the diagrams. If happy, commit the changes to the templates:

`git add *.hbs git commit -m "<A meaningful description of the changes made>" git push`

## Gotchas

-   If your links are generating a new node instead of linking to the intended existing node, check the scope of your link definition! You may be linking between two nodes which are not in scope (or you have misspelled an ID). Try moving the link to the outer scope.
    

## Build Pufferfish

You may need to add styles or change the layout of the diagram. To do this, you will need to build Pufferfish and publish a new image.

Clone pufferfish:

`git clone https://blairjordan@github.com/pufferfish.git && cd pufferfish`

To build a new version:

`yarn && yarn build`

To run the application locally:

`yarn start`

The application requires two parameters:

`--template`: A template file, e.g., `./templates/dev.hbs`

`--out`: The output path for the `dot` file, e.g., `dev.dot`

### Building a new Pufferfish image

To build a new image::

`yarn && yarn build && docker build . -t pufferfish:latest`

#### Test the image:

Run:
```
mkdir -p output

docker run \
	--rm \
	--name pufferfish \
	-v $(pwd)/templates:/usr/src/app/templates \
	-v $(pwd)/output:/usr/src/app/output \
	pufferfish

docker rm pufferfish
```

### Enhancements

I had to timebox the development of Pufferfish, so there are a lot of potential enhancements.

A few that I can think of:

-   Don’t bake images and styles into Docker image. These should ideally be exposed to the image as a volume.

-   Make markup translation generic: Specify markup translation (handlbars → dot) as pufferfish config.

-   Remove missing `lhead` / `thead` for vnet links. These will only produce warnings at the moment, but it would be nice to remove them. Requires some enhancement to the `injectLinkNodes` helper.

### **Why “Pufferfish”?**

The Japanese Pufferfish is “Nature’s Greatest Artist”: [https://www.youtube.com/watch?v=VQr8xDk_UaY](https://www.youtube.com/watch?v=VQr8xDk_UaY "https://www.youtube.com/watch?v=VQr8xDk_UaY")

## References

See MS Azure Architecture Icon guidelines here: [https://docs.microsoft.com/en-us/azure/architecture/icons/](https://docs.microsoft.com/en-us/azure/architecture/icons/ "https://docs.microsoft.com/en-us/azure/architecture/icons/")
