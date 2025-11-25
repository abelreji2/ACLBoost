import {defineField, defineType} from 'sanity'

export default defineType({
    name: 'exercises',
    title: 'Exercises',
    type: 'document',
    icon: () => '💪',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
            description: 'Name of the exercise',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            validation: (Rule) => Rule.required(),
            description: 'Description of the exercise',
            rows: 4,
        }),
        defineField({
            name: 'instruction',
            title: 'Instruction',
            type: 'text',
            validation: (Rule) => Rule.required(),
            description: 'Instructions for performing the exercise',
            rows: 4,
        }),
        defineField({
            name : 'muscleGroup',
            title: 'Muscle Group',
            type: 'string',
            validation: (Rule) => Rule.required(),
            description: 'Muscle group targeted by the exercise',
        }),
        defineField({
            name: 'difficulty',
            title: 'Difficulty',
            type: 'string',
            validation: (Rule) => Rule.required(),
            description: 'Difficulty level of the exercise',
            options: {
                list: [
                    {title: 'Post-op', value: 'post-op'},
                    {title: 'Control', value: 'control'},
                    {title: 'Intermediate Strengthening', value: 'intermediate'},
                    {title: 'Advanced Strengthening', value: 'advanced'},
                    {title: 'Athletic Performance', value: 'athletic'},
                ],
            },
        }),
        defineField({
            name: 'videoUrl',
            title: 'Video URL',
            type: 'url',
            validation: (Rule) => Rule.required(),
            description: 'URL of a video demonstrating the exercise',
        }),
        defineField({
            name: 'image',
            title: 'Exercise Image',
            type: 'image',
            description: 'Image showing the exercise',
            fields: [
                defineField({
                    name: 'alt',
                    title: 'Alternative Text',
                    type: 'string',
                    description: 'Description of the image for accessibility'
                })
            ]
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'description',
            media: 'image',
        },
    },
})
