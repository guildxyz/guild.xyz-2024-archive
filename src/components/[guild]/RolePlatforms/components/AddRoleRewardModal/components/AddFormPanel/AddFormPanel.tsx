import { Flex, Icon, Stack, Text } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Info } from "@phosphor-icons/react"
import { useAddRewardDiscardAlert } from "components/[guild]/AddRewardButton/hooks/useAddRewardDiscardAlert"
import CreateFormForm from "components/[guild]/CreateFormModal/components/CreateFormForm"
import useCreateForm from "components/[guild]/CreateFormModal/hooks/useCreateForm"
import { FormCreationSchema } from "components/[guild]/CreateFormModal/schemas"
import Button from "components/common/Button"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { AddRewardPanelProps } from "rewards"
import { PlatformGuildData, PlatformType } from "types"
import { uuidv7 } from "uuidv7"
import { CreateForm } from "."
import DefaultAddRewardPanelWrapper from "../../DefaultAddRewardPanelWrapper"
import ContinueWithExistingFormAlert from "./components/ContinueWithExistingFormAlert"

const defaultValues: CreateForm = {
  name: "",
  description: "",
  fields: [],
}

const AddFormPanel = ({ onAdd }: AddRewardPanelProps) => {
  const methods = useForm<CreateForm>({
    mode: "all",
    resolver: zodResolver(FormCreationSchema),
    defaultValues,
  })
  useAddRewardDiscardAlert(methods.formState.isDirty)

  const fields = useWatch({ control: methods.control, name: "fields" })
  const roleName = useWatch({ control: methods.control, name: "name" })

  const { onSubmit: onCreateFormSubmit, isLoading } = useCreateForm(
    (createdForm) => {
      methods.reset(defaultValues)
      onAdd({
        guildPlatform: {
          platformName: "FORM",
          platformId: PlatformType.FORM,
          platformGuildId: `form-${createdForm.id}`,
          platformGuildData: {
            formId: createdForm.id,
          } satisfies PlatformGuildData["FORM"],
        },
        isNew: true,
        roleName: roleName,
      })
    }
  )

  const onSubmit = (data: CreateForm) =>
    onCreateFormSubmit({
      ...data,
      fields: data.fields.map((field) => ({
        ...field,
        id: uuidv7(),
      })),
    })

  return (
    <FormProvider {...methods}>
      <DefaultAddRewardPanelWrapper>
        <Stack spacing={6}>
          <ContinueWithExistingFormAlert {...{ onAdd }} />
          <CreateFormForm />
          <Flex
            mt="4"
            justifyContent={{ base: "center", sm: "space-between" }}
            alignItems={{ base: "center", sm: "end" }}
            flexDir={{ base: "column-reverse", sm: "row" }}
            gap={4}
          >
            <Text colorScheme="gray" fontSize={"sm"}>
              <Icon d="inline-flex" mr="1" mt="-1.5px" as={Info} />
              You can edit everything later
            </Text>
            <Button
              colorScheme="green"
              rightIcon={<ArrowRight />}
              w={{ base: "full", sm: "max-content" }}
              onClick={methods.handleSubmit(onSubmit, console.error)}
              loadingText="Creating form"
              isLoading={isLoading}
              isDisabled={!fields?.length}
            >
              Create form & continue
            </Button>
          </Flex>
        </Stack>
      </DefaultAddRewardPanelWrapper>
    </FormProvider>
  )
}

export default AddFormPanel
