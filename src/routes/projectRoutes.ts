import { Router } from 'express'
import { body, param } from 'express-validator'
import { ProjectController } from '../controllers/ProjectController'
import { handleInputErrors } from '../middleware/validation'
import { TaskController } from '../controllers/TaskController'
import { projectExists } from '../middleware/project'
import { hasAuthorization, taskBelongsToProject, taskExists } from '../middleware/task'
import { authenticate } from '../middleware/auth'
import { TeamMemberController } from '../controllers/TeamController'
import { NoteController } from '../controllers/NoteController'

const router = Router()

router.use(authenticate)

router.post('/',
    body('projectName').notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').notEmpty().withMessage('La descripcion del proyecto es obligatorio'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/', ProjectController.getAllProjects)

router.get('/:id',
    param('id').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    ProjectController.getProjectById
)

router.param('projectId', projectExists)

router.put('/:projectId',
    param('projectId').isMongoId().withMessage('Id no valido'),
    body('projectName').notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').notEmpty().withMessage('La descripcion del proyecto es obligatorio'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject
)

router.delete('/:projectId',
    param('projectId').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProject
)

// Routes for Tasks


router.post('/:projectId/tasks',
    body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
    body('description').notEmpty().withMessage('La description no puede ir vacia'),
    handleInputErrors,
    TaskController.createTask
)

router.get('/:projectId/tasks',
    TaskController.getProjectTasks
)

//router.param('taskId', mongoId)
router.param('taskId', taskExists)
router.param('taskId', taskBelongsToProject)

router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('Id no valido'),
    body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
    body('description').notEmpty().withMessage('La descripcion no puede ir vacia'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('Id no valido'),
    body('status').notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)

// routes for teams
router.post('/:projectId/team/find',
    body('email').isEmail().toLowerCase().withMessage('Email no valido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.post('/:projectId/team',
    body('id').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TeamMemberController.addMemberToProject
)

router.get('/:projectId/team',
    TeamMemberController.getTeamMembers
)

router.delete('/:projectId/team/:userId',
    param('userId').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TeamMemberController.removeMemberFromProject
)

// Routes for Notes
router.post('/:projectId/tasks/:taskId/notes',
    body('content').notEmpty().withMessage('La nota requiere contenido.'),
    handleInputErrors,
    NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    NoteController.deleteNote
)

export default router