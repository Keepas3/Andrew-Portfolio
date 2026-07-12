import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'album',
  type: 'document',
  title: 'Albums & Projects', // This changes the name of the section in the Studio
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Album / Project Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      type: 'string',
      title: 'Card Subtitle / Label',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'URL Route Extension',
      description: 'Unique link identifier. Click "Generate" after typing a title.',
      options: {
        source: 'title', // Pulls directly from the document title now
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Square Album Jacket Art (Optional)',
      description: 'Leave empty to use a default placeholder.',
      options: { hotspot: true }
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Album Summary Description',
    }),
    defineField({
      name: 'projectLink',
      type: 'url',
      title: 'Link to Album or video etc. (Optional)',
    }),
    /* ─── ARRAY FOR SONGS & MEDIA UPLOADS ─── */
    defineField({
      name: 'tracks',
      type: 'array',
      title: 'Tracklist & Media Files',
      description: 'Add the songs and files that belong to this specific album.',
      of: [
        {
          type: 'object',
          name: 'trackItem',
          title: 'Track Entry',
          fields: [
            defineField({ 
              name: 'trackNumber', 
              type: 'string', 
              title: 'Track Number (e.g., 01)' 
            }),
            defineField({ 
              name: 'name', 
              type: 'string', 
              title: 'Song or Module Name' 
            }),
            defineField({ 
              name: 'duration', 
              type: 'string', 
              title: 'Length of song (ex: 3:42)' 
            }),
            defineField({
              name: 'mediaFile',
              type: 'file',
              title: 'Media Upload (Audio / MP4)',
              description: 'Upload the actual playable track or video file here.',
              options: {
                accept: 'audio/*,video/mp4,video/webm' 
              }
            })
          ]
        }
      ]
    })
  ],
  /* Studio Preview Configuration */
  preview: {
    select: {
      title: 'title',
      subtitle: 'topic', // This will display the Genre (e.g., "Heavy Bass") right under the title in the left sidebar!
      media: 'image'
    }
  }
});