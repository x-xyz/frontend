import {
  Button,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Spacer,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from '@chakra-ui/react'
import { TriangleDownIcon } from '@chakra-ui/icons'
import { FetchAccountActivityParams } from '@x/apis/dist/fn'
import { ActivityTypeV2 } from '@x/models/dist'
import { ChainId } from '@x/models'
import SelectChainId from 'components/input/SelectChainId'
import { useForm } from 'react-hook-form'
import { useMemo } from 'react'
import SelectActivityType from '../input/SelectActivityType'

export interface EventFiltersProps {
  hideFilters?: (keyof FetchAccountActivityParams)[]
  defaultValues?: FetchAccountActivityParams
  onValueChange?: (value: FetchAccountActivityParams) => void
}

export interface FormData {
  chainId?: ChainId
  activityTypes?: ActivityTypeV2[]
}

export default function EventFilters(props: EventFiltersProps) {
  return (
    <Popover placement="bottom-start" isLazy lazyBehavior="unmount">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button>
              Filters
              <TriangleDownIcon pos="relative" left={4} w={2} color="primary" />
            </Button>
          </PopoverTrigger>
          <PopoverContent w="90vw" maxW="380px">
            <PopoverHeader h="60px">
              <Stack direction="row" h="full" align="center">
                <Text fontSize="lg" variant="emphasis">
                  Filters
                </Text>
                <Spacer />
                <PopoverCloseButton pos="unset" />
              </Stack>
            </PopoverHeader>
            <Form onClose={onClose} {...props} />
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}

interface FormProps extends EventFiltersProps {
  onClose: () => void
}

function Form({ onClose, hideFilters = [], defaultValues, onValueChange }: FormProps) {
  const { watch, setValue, reset, handleSubmit } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      // ...defaultValues,
      chainId: defaultValues?.chainId,
      activityTypes: defaultValues?.types,
    },
  })

  const resetValues = useMemo<FormData>(
    () => ({
      chainId: hideFilters.includes('chainId') ? defaultValues?.chainId : void 0,
    }),
    [hideFilters, defaultValues?.chainId],
  )

  const submit = handleSubmit(({ chainId, activityTypes }) => {
    onValueChange?.({
      chainId,
      types: activityTypes,
    })
    onClose()
  })

  const panels: React.ReactNode[] = []

  if (!hideFilters.includes('chainId')) {
    panels.push(
      <AccordionItem key="chain-id-panel">
        <AccordionButton>
          <Stack direction="row" w="full" align="center">
            <Text fontSize="xs" fontWeight="bold" color="note">
              Blockchain
            </Text>
            <Spacer />
            <AccordionIcon />
          </Stack>
        </AccordionButton>
        <AccordionPanel>
          <SelectChainId value={watch('chainId')} onValueChange={v => setValue('chainId', v)} />
        </AccordionPanel>
      </AccordionItem>,
    )
  }

  if (!hideFilters.includes('types')) {
    panels.push(
      <AccordionItem key="type-panel" defaultChecked>
        <AccordionButton>
          <Stack direction="row" w="full" align="center">
            <Text fontSize="xs" fontWeight="bold" color="note">
              Event Type
            </Text>
            <Spacer />
            <AccordionIcon />
          </Stack>
        </AccordionButton>
        <AccordionPanel>
          <SelectActivityType value={watch('activityTypes')} onChange={v => setValue('activityTypes', v)} />
        </AccordionPanel>
      </AccordionItem>,
    )
  }

  return (
    <form onSubmit={submit}>
      <PopoverBody maxH="60vh" overflowY="auto">
        <Accordion allowMultiple allowToggle defaultIndex={[0, 1]}>
          {panels}
        </Accordion>
      </PopoverBody>
      <PopoverFooter>
        <Stack px={8} py={4}>
          <Button type="submit" w="full">
            Apply
          </Button>
          <Button type="reset" w="full" onClick={() => reset(resetValues)}>
            Reset All
          </Button>
        </Stack>
      </PopoverFooter>
    </form>
  )
}
