import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'album',
  type: 'document',
  title: 'Albums & Projects', 
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
        source: 'title', 
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    /* --- NEW STATUS FIELD --- */
    defineField({
      name: 'status',
      type: 'string',
      title: 'Project Status',
      description: 'Is this project finished or currently in development?',
      options: {
        list: [
          { title: 'Completed', value: 'completed' },
          { title: 'Work In Progress (WIP)', value: 'wip' }
        ],
        layout: 'radio' // Creates a simple radio button selection in the studio
      },
      initialValue: 'completed' // Defaults to completed when making a new post
    }),
    /* ------------------------ */
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
      name: 'time',
      type: 'datetime',
      title: 'Release Date',
    }),
    defineField({
      name: 'projectLink',
      type: 'url',
      title: 'Link to Album or video etc. (Optional)',
    }),
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
              name: 'albumArtist', 
              type: 'string', 
              title: 'Song Artist (probably just you)' 
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
  preview: {
    select: {
      title: 'title',
      subtitle: 'topic', 
      media: 'image'
    }
  }
});