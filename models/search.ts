import AppDataSource from "db";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  BaseEntity,
} from "typeorm";
import { Job } from "./job";

@Entity()
export class Search extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  q: string;

  @Column()
  place: string;

  @OneToMany(() => Job, (job) => job.search)
  jobs: Job[];

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
