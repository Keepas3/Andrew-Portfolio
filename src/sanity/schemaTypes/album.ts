import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'album',
  type: 'document',
  title: 'Discography Settings',
  fields: [
    defineField({
      name: 'pageTitle',
      type: 'string',
      title: 'Section / Page Title',
      description: 'e.g., Discography & Architecture, Releases, Music',
      initialValue: 'Discography & Architecture'
    }),
    defineField({
      name: 'albumList',
      type: 'array',
      title: 'Albums & Projects Catalog',
      description: 'Add your individual albums or project cards here. Drag to rearrange their position in the display grid.',
      of: [
        {
          type: 'object',
          name: 'albumItem',
          title: 'Catalog Entry',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Album / Project Title',
              description: 'e.g., Colorful World!!, Beloved Blessings',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'subtitle',
              type: 'string',
              title: 'Card Subtitle / Circle Label',
              description: 'e.g., Kashiwade 1st EP, Original Soundtrack, EDM Single',
            }),
            defineField({
              name: 'slug',
              type: 'slug',
              title: 'URL Route Extension',
              description: 'Unique link identifier. Click "Generate" after typing a title.',
              options: {
                source: (doc: any, options: { parent: any }) => options.parent?.title,
                maxLength: 96,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'image',
              type: 'image',
              title: 'Square Album Jacket Art',
              description: 'Upload a 1:1 square image here to keep the grid perfectly uniform.',
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              type: 'text',
              title: 'Album Summary Description',
              description: 'A brief backstory shown on the main card or detailed splash page.',
            }),
            defineField({
              name: 'category',
              type: 'string',
              title: 'Filter Category',
              options: {
                list: [
                  { title: 'Music', value: 'music' },
                  { title: 'Development', value: 'development' },
                  { title: 'Design', value: 'design' },
                  { title: 'Chess', value: 'chess' }
                ],
              },
              initialValue: 'music'
            }),
            defineField({
              name: 'projectLink',
              type: 'url',
              title: 'External Listen / View Link (Optional)',
              description: 'Link straight to a Spotify album or GitHub repository source.',
            }),
            /* ─── ARRAY FOR SONGS & TRACK RUNTIMES ─── */
            defineField({
              name: 'tracks',
              type: 'array',
              title: 'Tracklist / Features Breakdown',
              description: 'Add the items that appear when this jacket card is opened.',
              of: [
                {
                  type: 'object',
                  name: 'trackItem',
                  title: 'Track Entry',
                  fields: [
                    { name: 'trackNumber', type: 'string', title: 'Track / Index Number (e.g., 01)' },
                    { name: 'name', type: 'string', title: 'Song or Module Name' },
                    { name: 'duration', type: 'string', title: 'Length / Spec Info (e.g., 3:42 or v1.0.5)' }
                  ]
                }
              ]
            })
          ],
          /* Studio Preview Configuration */
          preview: {
            select: {
              title: 'title',
              subtitle: 'subtitle',
              media: 'image'
            }
          }
        }
      ]
    }) // ◄ FIXED: Removed the stray trailing comma from right here that was breaking compilation!
  ]
});