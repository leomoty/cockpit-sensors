/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import cockpit from 'cockpit';
import { dateTimeSeconds } from 'timeformat';
import React, { useEffect, useState, useCallback } from 'react';
import { EmptyStatePanel } from "cockpit-components-empty-state.jsx";
import { Page, PageSection, Grid, GridItem } from '@patternfly/react-core';
import { TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';

const _ = cockpit.gettext;

const Application = () => {
    const [sensors, setSensors] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    const getSensorsData = useCallback(() => {
        cockpit.spawn(["sensors", "-j"])
                .then(res => {
                    const normalizedRes = res.replaceAll(/temp\d+_/ig, "temp_");
                    const jsonResp = JSON.parse(normalizedRes);
                    setSensors(Object.entries(jsonResp));
                    setLastUpdated(new Date());
                });
    }, []);

    useEffect(() => {
        const interval = setInterval(getSensorsData, 1000);
        return () => clearInterval(interval);
    }, [getSensorsData]);

    if (!sensors.length) {
        return <EmptyStatePanel loading />;
    }

    return (
        <Page isFilled>
            <PageSection>
                <Grid hasGutter>
                    <GridItem>
                        <TableComposable variant='compact'>
                            <Thead>
                                <Tr>
                                    <Th>{_("Device")}</Th>
                                    <Th>{_("Temperature")}</Th>
                                    <Th>{_("Max Temp")}</Th>
                                    <Th>{_("Critical Temp")}</Th>
                                </Tr>
                            </Thead>
                            {sensors.map(([key, data]) => (
                                <Tbody key={key}>
                                    <Tr>
                                        <Td>{key} / {data.Adapter}</Td>
                                    </Tr>
                                    {Object.entries(data).filter(([k]) => k !== 'Adapter')
                                            .map(([key, value]) => (
                                                <Tr key={key}>
                                                    <Td>{key}</Td>
                                                    <Td>{value.temp_input} ºC</Td>
                                                    {value.temp_max ? <Td>{value.temp_max} ºC</Td> : null}
                                                    {value.temp_max ? <Td>{value.temp_crit} ºC</Td> : null}
                                                </Tr>)
                                            )}
                                </Tbody>
                            ))}
                        </TableComposable>
                        {lastUpdated ? <span>{_("Last updated at")} {formatDateTime(lastUpdated)}</span> : null}
                    </GridItem>
                </Grid>
            </PageSection>
        </Page>
    );
};

export { Application };
