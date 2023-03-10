import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { Search } from "./search";
import AppDataSource from "db";

@Entity()
export class Job extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  id_in_website: number;

  @Column()
  title: string;

  @Column({
    type: "date",
  })
  published_at: Date;

  @Column()
  place: string;

  @Column()
  salary_hour: number;

  @Column()
  salary_year: number;

  @Column()
  mean_salary_hour: number;

  @Column()
  min_work_hour: number;

  @Column()
  max_work_hour: number;

  @Column()
  employer_name: string;

  @Column()
  email: string;

  @ManyToOne(() => Search, (search) => search.jobs)
  search: number;

  @Column({
    type: Boolean,
    default: () => false,
  })
  is_scraped: Boolean;

  @Column({
    type: Boolean,
    default: () => false,
  })
  is_applied: Boolean;

  @Column({
    type: Boolean,
    default: () => false,
  })
  is_negotiable: Boolean;

  @Column({
    type: Boolean,
    default: () => false,
  })
  is_validate: Boolean;

  @Column()
  req_license: Boolean;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
