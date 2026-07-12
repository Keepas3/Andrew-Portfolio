
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
    }
  ]
};