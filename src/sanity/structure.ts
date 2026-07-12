import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items(S.documentTypeListItems())
    .items([
      // 1. Profile / Homepage (Forced into first place)
      S.listItem()
        .title('Profile')
        .schemaType('profile'),
      // 4. Active Projects
      S.listItem()
        .title('Album')
        .schemaType('album')
        .child(S.documentTypeList('album').title('Albums')),
      
      // 5. Gallery
      S.listItem()
        .title('Gallery')
        .schemaType('galleryTopic')
        .child(
          S.documentTypeList('galleryTopic')
            .title('Albums & Archives')
        ),
    
    ])