CREATE TABLE "class_import_jobs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "class_import_jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"class_id" integer NOT NULL,
	"uploaded_by" text NOT NULL,
	"file_name" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_rows" integer DEFAULT 0 NOT NULL,
	"success_rows" integer DEFAULT 0 NOT NULL,
	"failed_rows" integer DEFAULT 0 NOT NULL,
	"error_details" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "class_import_jobs_status_valid" CHECK ("class_import_jobs"."status" in ('pending', 'processing', 'done', 'failed')),
	CONSTRAINT "class_import_jobs_counts_valid" CHECK ("class_import_jobs"."total_rows" >= 0 and "class_import_jobs"."success_rows" >= 0 and "class_import_jobs"."failed_rows" >= 0 and "class_import_jobs"."success_rows" + "class_import_jobs"."failed_rows" <= "class_import_jobs"."total_rows")
);
--> statement-breakpoint
CREATE TABLE "class_members" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "class_members_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"class_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"join_method" text NOT NULL,
	"student_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "class_members_class_id_user_id_unique" UNIQUE("class_id","user_id"),
	CONSTRAINT "class_members_join_method_valid" CHECK ("class_members"."join_method" in ('code', 'excel_import')),
	CONSTRAINT "class_members_student_code_not_empty" CHECK ("class_members"."student_code" is null or length(trim("class_members"."student_code")) > 0)
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "classes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"code" text NOT NULL,
	"min_size" integer DEFAULT 0 NOT NULL,
	"max_size" integer NOT NULL,
	"owner_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "classes_code_unique" UNIQUE("code"),
	CONSTRAINT "classes_code_format" CHECK ("classes"."code" ~ '^[A-Z0-9]{6,8}$'),
	CONSTRAINT "classes_name_not_empty" CHECK (length(trim("classes"."name")) > 0),
	CONSTRAINT "classes_size_valid" CHECK ("classes"."min_size" >= 0 and "classes"."max_size" > 0 and "classes"."min_size" <= "classes"."max_size"),
	CONSTRAINT "classes_status_valid" CHECK ("classes"."status" in ('active', 'archived'))
);
--> statement-breakpoint
CREATE TABLE "exam_questions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exam_questions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"exam_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"points" numeric(5, 2) DEFAULT 1 NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exam_questions_exam_id_question_id_unique" UNIQUE("exam_id","question_id"),
	CONSTRAINT "exam_questions_exam_id_position_unique" UNIQUE("exam_id","position"),
	CONSTRAINT "exam_questions_points_positive" CHECK ("exam_questions"."points" > 0),
	CONSTRAINT "exam_questions_position_non_negative" CHECK ("exam_questions"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"class_id" integer NOT NULL,
	"created_by" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"deadline" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exams_title_not_empty" CHECK (length(trim("exams"."title")) > 0),
	CONSTRAINT "exams_status_valid" CHECK ("exams"."status" in ('draft', 'published', 'closed'))
);
--> statement-breakpoint
CREATE TABLE "question_answer_keys" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_answer_keys_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"question_id" integer NOT NULL,
	"blank_index" integer DEFAULT 1 NOT NULL,
	"accepted_value" text NOT NULL,
	"match_mode" text DEFAULT 'exact' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_answer_keys_blank_index_positive" CHECK ("question_answer_keys"."blank_index" >= 1),
	CONSTRAINT "question_answer_keys_accepted_value_not_empty" CHECK (length(trim("question_answer_keys"."accepted_value")) > 0),
	CONSTRAINT "question_answer_keys_match_mode_valid" CHECK ("question_answer_keys"."match_mode" in ('exact', 'case_insensitive', 'numeric'))
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_options_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"question_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_options_question_id_position_unique" UNIQUE("question_id","position"),
	CONSTRAINT "question_options_content_not_empty" CHECK (length(trim("question_options"."content")) > 0),
	CONSTRAINT "question_options_position_non_negative" CHECK ("question_options"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "questions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_by" text NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"allow_multiple" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questions_type_valid" CHECK ("questions"."type" in ('multiple_choice', 'fill_blank', 'final_answer')),
	CONSTRAINT "questions_content_not_empty" CHECK (length(trim("questions"."content")) > 0)
);
--> statement-breakpoint
CREATE TABLE "submission_answer_options" (
	"submission_answer_id" integer NOT NULL,
	"option_id" integer NOT NULL,
	CONSTRAINT "submission_answer_options_pk" PRIMARY KEY("submission_answer_id","option_id")
);
--> statement-breakpoint
CREATE TABLE "submission_answers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "submission_answers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"submission_id" integer NOT NULL,
	"exam_question_id" integer NOT NULL,
	"text_value" text,
	"blank_values" jsonb,
	"is_correct" boolean,
	"score" numeric(6, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submission_answers_submission_id_exam_question_id_unique" UNIQUE("submission_id","exam_question_id"),
	CONSTRAINT "submission_answers_score_non_negative" CHECK ("submission_answers"."score" is null or "submission_answers"."score" >= 0)
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "submissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"exam_id" integer NOT NULL,
	"student_id" text NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"score" numeric(6, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submissions_exam_id_student_id_unique" UNIQUE("exam_id","student_id"),
	CONSTRAINT "submissions_status_valid" CHECK ("submissions"."status" in ('in_progress', 'submitted')),
	CONSTRAINT "submissions_score_non_negative" CHECK ("submissions"."score" is null or "submissions"."score" >= 0)
);
--> statement-breakpoint
ALTER TABLE "class_import_jobs" ADD CONSTRAINT "class_import_jobs_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_import_jobs" ADD CONSTRAINT "class_import_jobs_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_members" ADD CONSTRAINT "class_members_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_members" ADD CONSTRAINT "class_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_answer_keys" ADD CONSTRAINT "question_answer_keys_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_answer_options" ADD CONSTRAINT "submission_answer_options_submission_answer_id_submission_answers_id_fk" FOREIGN KEY ("submission_answer_id") REFERENCES "public"."submission_answers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_answer_options" ADD CONSTRAINT "submission_answer_options_option_id_question_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."question_options"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_answers" ADD CONSTRAINT "submission_answers_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_answers" ADD CONSTRAINT "submission_answers_exam_question_id_exam_questions_id_fk" FOREIGN KEY ("exam_question_id") REFERENCES "public"."exam_questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "class_import_jobs_class_id_created_at_idx" ON "class_import_jobs" USING btree ("class_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "class_members_class_id_student_code_unique" ON "class_members" USING btree ("class_id","student_code") WHERE "class_members"."student_code" is not null;--> statement-breakpoint
CREATE INDEX "class_members_user_id_idx" ON "class_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "classes_owner_id_idx" ON "classes" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "exam_questions_question_id_idx" ON "exam_questions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "exams_class_id_status_idx" ON "exams" USING btree ("class_id","status");--> statement-breakpoint
CREATE INDEX "exams_created_by_idx" ON "exams" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "question_answer_keys_question_blank_value_unique" ON "question_answer_keys" USING btree ("question_id","blank_index",lower("accepted_value"));--> statement-breakpoint
CREATE INDEX "questions_created_by_idx" ON "questions" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "submission_answer_options_option_id_idx" ON "submission_answer_options" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "submission_answers_exam_question_id_idx" ON "submission_answers" USING btree ("exam_question_id");--> statement-breakpoint
CREATE INDEX "submissions_exam_id_status_idx" ON "submissions" USING btree ("exam_id","status");--> statement-breakpoint
CREATE INDEX "submissions_student_id_status_idx" ON "submissions" USING btree ("student_id","status");