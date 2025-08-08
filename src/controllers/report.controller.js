const PDFTemplate = require('../helpers/PDFTemplates')
const helpers = require('../helpers/helpers')
const fs = require('fs')
const path = require('path')

class ReportController {

    generateProjectReportPDF = async (req, res) => {
        try {
            const projectId = req.params.projectId
            const fileName = `project-report-${projectId}.pdf`
            const reportsDir = path.join(__dirname, '../reports')
            const outputPath = path.join(reportsDir, fileName)

            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true })
            }

            await PDFTemplate.createProjectReportPDF(projectId, outputPath)

            if (!fs.existsSync(outputPath)) {
                throw new Error('Report file was not created')
            }

            const fileUrl = `${req.protocol}://${req.get('host')}/src/reports/${fileName}`

            res.json(helpers.responseSuccess('Report Created Successfully',fileUrl))

        } catch (err) {
            res.status(500).json(helpers.responseError(err.message))
        }
    }

}

module.exports = new ReportController()
