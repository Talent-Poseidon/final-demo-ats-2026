"use client"

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";

const projectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  assignees: z.array(
    z.object({
      email: z.string().email("Invalid email format"),
      name: z.string().min(1, "Assignee name is required"),
    })
  ),
});

interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: "",
      startDate: new Date(),
      endDate: new Date(),
      assignees: [{ email: "", name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assignees",
  });

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data: Project[]) => setProjects(data))
      .catch((err: Error) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(values: z.infer<typeof projectSchema>) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      setConfirmationMessage("Project created successfully");
    } else {
      throw new Error("Failed to create project");
    }
  }

  return (
    <div>
      <nav role="navigation" aria-label="Projects">
        <h1 data-testid="project-menu">Projects</h1>
      </nav>
      <div role="container" aria-label="Project List" data-testid="project-list">
        {loading ? (
          <p>Loading...</p>
        ) : projects.length > 0 ? (
          <ul>
            {projects.map((project) => (
              <li key={project.id}>{project.name}</li>
            ))}
          </ul>
        ) : (
          <p>No projects found</p>
        )}
      </div>
      <Button data-testid="setup-new-project-btn">Setup New Project</Button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input data-testid="project-name-input" placeholder="Project Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Calendar
                    selected={field.value}
                    onSelect={field.onChange}
                    data-testid="start-date-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Calendar
                    selected={field.value}
                    onSelect={field.onChange}
                    data-testid="end-date-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {fields.map((field, index) => (
            <div key={field.id} className="flex space-x-2">
              <FormField
                control={form.control}
                name={`assignees.${index}.email`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee Email</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="assignee-email-input"
                        placeholder="Assignee Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`assignees.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee Name</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="assignee-name-input"
                        placeholder="Assignee Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={() => remove(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" onClick={() => append({ email: "", name: "" })}>
            Add Assignee
          </Button>
          <Button type="submit" data-testid="submit-project-btn">Submit</Button>
        </form>
      </Form>
      {confirmationMessage && (
        <div role="alert" data-testid="confirmation-message">
          {confirmationMessage}
        </div>
      )}
    </div>
  );
}
