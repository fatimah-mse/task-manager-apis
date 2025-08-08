require('dotenv').config()
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')
const Project = require('../models/Project')
const Task = require('../models/Task')
const ActivityLog = require('../models/ActivityLog')
const myPrimary = '#3754DB'
const mySecondary = '#FBBE37'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

class PDFTemplate {

    createProjectReportPDF = async (projectId, outputPath = 'project-report.pdf') => {
        try {
            const project = await Project.findById(projectId)
            const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name')

            const startDate = new Date(project.startDate)
            const endDate = new Date(project.endDate)
            const today = new Date()

            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
            const rawPassedDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24))
            const passedDays = Math.max(0, Math.min(rawPassedDays, totalDays))
            const remainingDays = Math.max(0, totalDays - passedDays)
            const progress = totalDays > 0 ? Math.round((passedDays / totalDays) * 100) : 0

            const logs = await ActivityLog.find({ project: projectId })
                .sort({ createdAt: -1 })
                .populate("user", "name")
                .populate("task", "title")

            if (!project) throw new Error('Project not Found')

            const doc = new PDFDocument({ margin: 24 })

            doc.registerFont('Manrope', path.join(__dirname, '../fonts', 'Manrope-VariableFont_wght.ttf'))
            doc.registerFont('WinkyRough', path.join(__dirname, '../fonts', 'WinkyRough-VariableFont_wght.ttf'))

            const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right

            return new Promise((resolve, reject) => {
                const stream = fs.createWriteStream(outputPath)
                doc.pipe(stream)

                doc.rect(0, 0, doc.page.width, 50).fill(myPrimary)

                doc.fillColor('white').fontSize(20).font('WinkyRough').text('Teamio', doc.page.margins.left, (50 - 24) / 2, {
                    width: 250,
                    align: 'left',
                })

                doc.text(`${project.name}`, doc.page.margins.left, (50 - 24) / 2, {
                    width: contentWidth,
                    align: 'right',
                })

                doc.moveDown(0.7)

                doc.fillColor(mySecondary).fontSize(10).font('WinkyRough').text(
                    `Customer Support: ${ADMIN_EMAIL}`,
                    doc.page.margins.left,
                    doc.y,
                    {
                        width: contentWidth,
                        align: 'right',
                        underline: true,
                    }
                )

                doc.moveDown(2)

                doc.fillColor(myPrimary).fontSize(16).font('WinkyRough').text('Project Information', {
                    underline: true,
                    width: contentWidth,
                    align: 'left',
                })
                doc.moveDown(0.2)

                doc.fillColor('black').fontSize(10).font('Manrope')
                    .text(`Description : ${project.description}`, { width: contentWidth, align: 'left' })
                    .text(`Start Date : ${startDate.toDateString()}`, { width: contentWidth, align: 'left' })
                    .text(`End Date : ${endDate.toDateString()}`, { width: contentWidth, align: 'left' })
                    .text(`Total Tasks : ${project.totalTasks}`, { width: contentWidth, align: 'left' })
                    .text(`Completed Tasks : ${project.completedTasks}`, { width: contentWidth, align: 'left' })
                    .text(`Total Days : ${totalDays}`, { width: contentWidth, align: 'left' })
                    .text(`Days Passed : ${passedDays}`, { width: contentWidth, align: 'left' })
                    .text(`Remaining Days : ${remainingDays}`, { width: contentWidth, align: 'left' })
                    .text(`Progress : ${progress}%`, { width: contentWidth, align: 'left' })

                doc.moveDown(1)

                doc.fillColor(myPrimary).fontSize(16).font('WinkyRough').text('Tasks List', {
                    underline: true,
                    width: contentWidth,
                    align: 'left',
                })
                doc.moveDown(0.2)

                if (!tasks || tasks.length === 0) {
                    doc.fillColor(mySecondary)
                        .fontSize(12)
                        .font('WinkyRough')
                        .text('No Tasks Available.', { width: contentWidth, align: 'left' })
                        .moveDown(1)
                } else {
                    tasks.forEach((task, index) => {
                        doc.fillColor(myPrimary)
                            .fontSize(12)
                            .font('WinkyRough')
                            .text(`${index + 1}. ${task.title}`, {
                                width: contentWidth,
                                align: 'left',
                            })

                        doc.fillColor('black')
                            .fontSize(10)
                            .font('Manrope')
                            .text(`Description : ${task.description}`, { width: contentWidth, align: 'left' })
                            .text(`Assigned To : ${task.assignedTo?.name || 'N/A'}`, { width: contentWidth, align: 'left' })
                            .text(`Due Date : ${task.dueDate.toDateString()}`, { width: contentWidth, align: 'left' })
                            .text(`Priority : ${task.priority}`, { width: contentWidth, align: 'left' })
                            .text(`Status : ${task.status}`, { width: contentWidth, align: 'left' })
                            .moveDown(0.7)
                    })
                }

                doc.moveDown(1)

                doc.fillColor(myPrimary).fontSize(16).font('WinkyRough').text('Activity Logs', {
                    underline: true,
                    width: contentWidth,
                    align: 'left',
                })
                doc.moveDown(0.5)

                if (!logs || logs.length === 0) {
                    doc.fillColor(mySecondary)
                        .fontSize(12)
                        .font('WinkyRough')
                        .text('No Activity Available.', { width: contentWidth, align: 'left' })
                        .moveDown(1)
                } else {
                    logs.forEach((log, index) => {
                        doc.fillColor(myPrimary).fontSize(12).font('WinkyRough')
                            .text(`${index + 1}. [${log.type}] - ${log.description}`, {
                                width: contentWidth,
                                align: 'left'
                            })
                        doc.moveDown(0.2)
                        doc.fillColor('black').fontSize(10).font('Manrope')
                            .text(`    Date: ${log.createdAt.toDateString()}`, { width: contentWidth, align: 'left' })
                            .text(`    Task: ${log.task?.title || 'N/A'}`, { width: contentWidth, align: 'left' })
                            .text(`    Details: ${log.note?.content || 'N/A'}`, { width: contentWidth, align: 'left' })
                            .moveDown(0.7)
                    })
                }

                doc.end()

                stream.on('finish', () => resolve(outputPath))
                stream.on('error', (err) => reject(err))
            })

        } catch (error) {
            throw new Error(error.message)
        }
    }

}

module.exports = new PDFTemplate ()