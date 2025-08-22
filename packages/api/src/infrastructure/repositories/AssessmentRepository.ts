import { IAssessmentRepository } from '../../application/contracts';
import { Assessment as AssessmentType, CreateAssessmentDTO } from '../../types';
import { Assessment } from '../sequelize/models';

export class AssessmentRepository implements IAssessmentRepository {
  public async create(assessmentData: CreateAssessmentDTO): Promise<AssessmentType> {
    // TODO: Implement Create
    const created = await Assessment.create({
      catDateOfBirth: assessmentData.catDateOfBirth,
      catName: assessmentData.catName,
      instrumentType: assessmentData.instrumentType,
      riskLevel: assessmentData.riskLevel,
      score: assessmentData.score,
    });

    // Return plain object matching the Assessment type
    return created.get({ plain: true }) as unknown as AssessmentType;
  }

  public async findAll(): Promise<AssessmentType[]> {
    // TODO: Implement Find All
    const rows = await Assessment.findAll({
      order: [[ `createdAt`, `DESC` ]], // Paranoid enabled, so deletedAt is handled automatically
    });

    return rows.map((r) => r.get({ plain: true })) as unknown as AssessmentType[];
  }

  public async delete(id: number): Promise<boolean> {
    const count = await Assessment.destroy({ where: { id } });
    return count > 0;
  }
}
