import type { Database} from '@nocobase/database';
import { Model } from '@nocobase/database';
import type { BelongsToGetAssociationMixin, HasManyGetAssociationsMixin } from 'sequelize';
import type WorkflowModel from './Workflow';
import type JobModel from './Job';

export default class ExecutionModel extends Model {
  declare static readonly database: Database;

  declare id: number;
  declare title: string;
  declare context: any;
  declare status: number;
  // NOTE: this duplicated column is for transaction in preparing cycle from workflow
  declare useTransaction: boolean;
  declare transaction: string;

  declare createdAt: Date;
  declare updatedAt: Date;

  declare key: string;

  declare workflow?: WorkflowModel;
  declare getWorkflow: BelongsToGetAssociationMixin<WorkflowModel>;

  declare jobs?: JobModel[];
  declare getJobs: HasManyGetAssociationsMixin<JobModel>;
}
