import {defineField, defineType, defineArrayMember} from 'sanity'
import exercises from './exercises'

export default defineType({
    name: 'workout',
    title: 'Workout',
    type: 'document',
    icon: () => '🏋️‍♂️',
    fields: [
        defineField({
            name: 'userId',
            title: 'User ID',
            type: 'string',
            validation: (Rule) => Rule.required(),
            description: 'Clerk ID of the user who created the workout',
        }),
        defineField({
            name: 'date',
            title: 'Workout Date',
            type: 'datetime',
            description: 'Date and time when the workout was performed',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'duration',
            title: 'Duration in seconds',
            type: 'number',
            validation: (Rule) => Rule.required().min(0),
            description: 'Duration of the workout in seconds',
        }),
        defineField({
            name: 'exercises',
            title: 'Exercises',
            type: 'array',
            description: 'List of exercises performed in this workout',
            of: [defineArrayMember({
                type: 'object',
                name: 'workoutExercise',
                title: 'Workout Exercise',
                fields: [
                    defineField({
                        name: 'exercise',
                        title: 'Exercise',
                        type: 'reference',
                        to: [{type: exercises.name}],
                        validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                        name: 'sets',
                        title: 'Sets',
                        description: 'Number of sets performed',
                        type: 'array',
                        validation: (Rule) => Rule.required().min(1),
                        of: [
                            defineArrayMember({
                                type: 'object',
                                name: 'set',
                                title: 'Set',
                                fields: [
                                    defineField({
                                        name: 'reps',
                                        title: 'Reps',
                                        type: 'number',
                                        validation: (Rule) => Rule.required().min(0),
                                    }),
                                    defineField({
                                        name: 'weight',
                                        title: 'Weight',
                                        type: 'number',
                                        validation: (Rule) => Rule.required().min(0),
                                    }),
                                ],
                                preview: {
                                    select: {
                                        reps: 'reps',
                                        weight: 'weight',
                                    },
                                    prepare({reps, weight}) {
                                        return {
                                            title: `Reps: ${reps} reps`,
                                            subtitle: `Weight: ${weight} lbs`,
                                        }
                                    },
                                },                             
                            }),
                        ],
                    }),
                ],
                preview: {
                    select: {
                        exerciseName: 'exercise.name',
                        sets: 'sets',
                    },
                    prepare({ exerciseName, sets }) {
                        const setCount = sets ? sets.length : 0
                        return {
                            title: exerciseName,
                            subtitle: `${setCount} set${setCount === 1 ? '' : 's'}`,
                        }
                    },
                },
            }),
        ],
    }),
],
preview: {
    select: {
        date: 'date',
        duration: 'duration',
        exercises: 'exercises',
    },
    prepare({ date, duration, exercises }: { date?: string; duration?: number; exercises?: any[] }) {
        const workoutDate = date ? new Date(date).toLocaleDateString() : 'No date'
        const workoutDuration = duration ? Math.round(duration / 60): 0
        const exerciseCount = exercises ? exercises.length : 0
        return {
            title: `Workout on ${workoutDate}`,
            subtitle: `${workoutDuration} min - ${exerciseCount} exercises ${exerciseCount === 1 ? '' : 's' }`,
        }
    }
},
})