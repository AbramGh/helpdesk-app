import { Test, type TestingModule } from "@nestjs/testing"
import { IssuesService } from "./issues.service"
import { PrismaService } from "../prisma/prisma.service"
import { NotificationsService } from "../notifications/notifications.service"
import { jest } from "@jest/globals"

describe("IssuesService", () => {
  let service: IssuesService
  let prismaService: PrismaService
  let notificationsService: NotificationsService

  const mockIssue = {
    id: "issue-1",
    title: "Test Issue",
    description: "Test Description",
    status: "open",
    priority: "medium",
    organizationId: "org-1",
    createdById: "user-1",
    assigneeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuesService,
        {
          provide: PrismaService,
          useValue: {
            issue: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            notifyIssueCreated: jest.fn(),
            notifyStatusChanged: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<IssuesService>(IssuesService)
    prismaService = module.get<PrismaService>(PrismaService)
    notificationsService = module.get<NotificationsService>(NotificationsService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("should create a new issue", async () => {
      jest.spyOn(prismaService.issue, "create").mockResolvedValue(mockIssue)
      jest.spyOn(notificationsService, "notifyIssueCreated").mockResolvedValue(undefined)

      const createIssueDto = {
        title: "Test Issue",
        description: "Test Description",
        priority: "medium" as const,
        organizationId: "org-1",
      }

      const result = await service.create(createIssueDto, "user-1")

      expect(result).toEqual(mockIssue)
      expect(prismaService.issue.create).toHaveBeenCalledWith({
        data: {
          ...createIssueDto,
          createdById: "user-1",
          status: "open",
        },
        include: expect.any(Object),
      })
      expect(notificationsService.notifyIssueCreated).toHaveBeenCalledWith(mockIssue.id, "user-1")
    })
  })

  describe("findAll", () => {
    it("should return paginated issues", async () => {
      const mockIssues = [mockIssue]
      jest.spyOn(prismaService.issue, "findMany").mockResolvedValue(mockIssues)
      jest.spyOn(prismaService.issue, "count").mockResolvedValue(1)

      const result = await service.findAll({}, 1, 10)

      expect(result).toEqual({
        issues: mockIssues,
        total: 1,
        page: 1,
        totalPages: 1,
      })
    })
  })

  describe("updateStatus", () => {
    it("should update issue status and send notification", async () => {
      const updatedIssue = { ...mockIssue, status: "in-progress" }
      jest.spyOn(prismaService.issue, "findUnique").mockResolvedValue(mockIssue)
      jest.spyOn(prismaService.issue, "update").mockResolvedValue(updatedIssue)
      jest.spyOn(notificationsService, "notifyStatusChanged").mockResolvedValue(undefined)

      const result = await service.updateStatus("issue-1", "in-progress", "user-1")

      expect(result).toEqual(updatedIssue)
      expect(notificationsService.notifyStatusChanged).toHaveBeenCalledWith("issue-1", "open", "in-progress", "user-1")
    })
  })
})
