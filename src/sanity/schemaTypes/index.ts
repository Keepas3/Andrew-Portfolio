import { type SchemaTypeDefinition } from 'sanity'

import {profile} from './profile'
import album from './album'
import galleryItem from './galleryItem'
import galleryTopic from './galleryTopic'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    profile,
    album,
    galleryTopic,
    galleryItem,
  ],
}