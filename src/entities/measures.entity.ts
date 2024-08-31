import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum MeasureType {
    WATER = "WATER",
    GAS = "GAS",
}

@Entity('measures')
class Measure {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column("text")
    image_url!: string;

    @Column()
    customer_code!: string;

    @Column()
    measure_datetime!: Date;

    @Column()
    measure_value!: number;

    @Column({
        type: "enum",
        enum: MeasureType,
    })
    measure_type!: MeasureType;

    @Column({ type: "boolean", default: false })
    measure_confirmed!: boolean;
}

export { Measure };
