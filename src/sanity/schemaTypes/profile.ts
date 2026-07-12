

export const profile = {
  name: 'profile',
  title: 'Profile Metadata',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Display Name',
      type: 'string',
      initialValue: 'Andrew'
    },
    {
      name: 'biography',
      title: 'Short Summary / Bio Text',
      type: 'text'
    },
    {
      name: 'profileImage',
      title: 'Avatar / Profile Picture',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'programsSection',
      title: 'Programs / Tools Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Programs I use'
        },
        {
          name: 'description',
          title: 'Section Description',
          type: 'text'
        },
        {
          name: 'items',
          title: 'Items / Tags',
          type: 'array',
          of: [{ type: 'string' }]
        }
      ]
    },
    {
      name: 'favoritesSection',
      title: 'Favorites / Hobbies Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Stuff I like to do'
        },
        {
          name: 'description',
          title: 'Section Description',
          type: 'text'
        },
        {
          name: 'items',
          title: 'Items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'title',
                  title: 'Item Title',
                  type: 'string'
                },
                {
                  name: 'detail',
                  title: 'Item Detail',
                  type: 'text'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'connectSection',
      title: 'Connect / Socials Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Collaborate / Connect'
        },
        {
          name: 'description',
          title: 'Section Description',
          type: 'text'
        },
        {
          name: 'socialLinks',
          title: 'Social Links',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'label',
                  title: 'Label',
                  type: 'string'
                },
                {
                  name: 'url',
                  title: 'URL',
                  type: 'url'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'spotifyEmbedUrl',
      title: 'Spotify Embed URL',
      type: 'url',
      description: 'Paste a Spotify track, album, or playlist URL (or an embed URL) to display in the Now Listening section.'
    }

  ]
};